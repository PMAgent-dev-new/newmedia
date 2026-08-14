import type { Blog, BlogsResponse } from "@/types/microcms";

/**
 * 全記事を取得する、キャッシュされ、失敗したら黙らない版。
 *
 * `microcms.ts` の getAllBlogs は `cache: "no-store"` を持ち、例外を握り潰して
 * `{contents: [], totalCount: 0}` を返す。記事詳細のように「常に最新」が要る面には
 * それでよいが、全件走査する面（/media/videos・sitemap）で使うと2つ困る。
 *
 * 1. `export const revalidate` が no-store に打ち消され、1リクエストごとに
 *    214記事分を取り直す（本文込みだと実測 4.3MB / 9コール）。microCMS は API 5/5 が満杯で
 *    レート制限もあるため、ヘッダー全ページから導線のある面がこれをやるのは危険
 * 2. 取得に失敗しても 200 で「0件」を配ってしまう。sitemap なら空、一覧なら
 *    「動画つきの記事はまだありません」が、クロールされうる状態で出る
 *
 * ここでは Next の fetch キャッシュに載せ、**失敗は throw する**。ISR は直前の
 * 生成結果を配り続けるので、CMSの一時障害でページが空になることはない。
 */

// 参照する env は microcms.ts と同じ優先順（SERVICE_DOMAIN が正・NEXT_PUBLIC_ はフォールバック）。
const SERVICE_DOMAIN =
  process.env.MICROCMS_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || "";
const API_KEY = process.env.MICROCMS_API_KEY || process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "";

/** 全件走査の面はこの間隔で十分（記事の公開は1日1〜2本）。 */
export const ALL_BLOGS_REVALIDATE = 3600;

/**
 * 本文を走査する面（/media/videos）が使うページ幅。
 *
 * Next のデータキャッシュは **1エントリ2MBまで**で、超えると警告を出して
 * 「そのfetchは一切キャッシュされない」状態になる（= revalidate ごとに全件取り直し）。
 * しかも本文は base64 で格納されるため、実際に使える生JSONは 2MB×3/4 ≒ 1.5MB しかない。
 *
 * 実測（214記事）:
 *   limit=100 → 最大 2.16MB/ページ（base64 で 2.88MB）→ 上限超過。これが警告の正体
 *   limit=50  → 最大 1.08MB（1.45MB）→ 収まるが余裕28%。記事が長くなると再発する
 *   limit=25  → 最大 0.58MB（0.77MB）→ 余裕61%。最大級の記事(52KB)が25本並んでも収まる
 *
 * ⚠️ `fields` を絞っても解決しない。本文以外は全記事あわせて35KB（全体の1.8%）しかなく、
 * 容量はほぼ本文そのものだから。効くのはページ幅だけ。
 * 転送量は変わらず9リクエストに増えるが、microCMS は大きなページの組み立てが遅く、
 * 全件取得は逆に速くなる（実測 10.2秒 → 3.9秒）。
 */
export const BODY_SCAN_PAGE = 25;

/**
 * 本文走査に要るフィールドだけ。本文（content/html）とカードの表示項目のみ。
 * 容量への寄与は小さいが、`category` などの参照を展開させない意味はある。
 */
export const BODY_SCAN_FIELDS = "id,title,slug,eyecatch,publishedAt,content,html";

const DEFAULT_PAGE = 100;
/** 暴走防止。到達したら黙って切り捨てず気づけるようにする。 */
const MAX_ARTICLES = 3000;

async function page(
  offset: number,
  fields: string | undefined,
  revalidate: number,
  pageSize: number,
): Promise<BlogsResponse> {
  const qs = new URLSearchParams({
    limit: String(pageSize),
    offset: String(offset),
    orders: "-publishedAt",
  });
  if (fields) qs.set("fields", fields);
  const res = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/blogs?${qs}`, {
    headers: { "X-MICROCMS-API-KEY": API_KEY },
    next: { revalidate },
  });
  // 部分失敗（2ページ目だけ 429 等）を握り潰すと、一覧から記事が静かに欠ける。
  if (!res.ok) {
    throw new Error(`microCMS blogs fetch failed: ${res.status} (offset=${offset})`);
  }
  return res.json();
}

/**
 * 全記事。1件でも取れなければ throw する（0件と取得失敗を混同しない）。
 *
 * `pageSize` は「1リクエスト＝1キャッシュエントリ」の大きさを決める。本文を含める
 * 呼び出しは既定の100だと Next のデータキャッシュ上限（2MB／エントリ）を超えて
 * **何もキャッシュされない**ので、必ず BODY_SCAN_PAGE を渡すこと（下のコメント参照）。
 */
export async function fetchAllBlogsCached(opts: {
  fields?: string;
  revalidate?: number;
  pageSize?: number;
} = {}): Promise<Blog[]> {
  if (!SERVICE_DOMAIN || !API_KEY) {
    throw new Error("microCMS の環境変数が未設定です（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）");
  }
  const revalidate = opts.revalidate ?? ALL_BLOGS_REVALIDATE;
  const pageSize = opts.pageSize ?? DEFAULT_PAGE;
  const all: Blog[] = [];
  const first = await page(0, opts.fields, revalidate, pageSize);
  all.push(...(first.contents || []));

  // 上限は「記事数」で持つ。ページ数で持つと pageSize を下げた呼び出しだけ
  // 天井が下がり、一覧が静かに欠ける。
  const maxPages = Math.ceil(MAX_ARTICLES / pageSize);
  const needed = Math.ceil(first.totalCount / pageSize);
  if (needed > maxPages) {
    console.warn(`[allBlogs] 記事 ${first.totalCount} 件が上限 ${MAX_ARTICLES} 件を超えました。一覧が欠けます。`);
  }
  for (let i = 1; i < Math.min(needed, maxPages); i++) {
    const res = await page(i * pageSize, opts.fields, revalidate, pageSize);
    all.push(...(res.contents || []));
  }
  return all;
}

/**
 * slug 重複を1本に畳む。同じ slug のレコードが複数あると同一URLを指すため、
 * 記事詳細が解決するのと同じ「publishedAt が新しい方」を残す（本番sitemapに3件の重複が出ていた）。
 */
export function dedupeBySlug(blogs: Blog[]): Blog[] {
  const by = new Map<string, Blog>();
  for (const b of blogs) {
    const key = (b.slug || b.id) as string;
    const cur = by.get(key);
    if (!cur || (b.publishedAt || "") > (cur.publishedAt || "")) by.set(key, b);
  }
  return [...by.values()];
}
