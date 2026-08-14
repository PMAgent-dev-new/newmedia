import type { Blog, BlogsResponse } from "@/types/microcms";

/**
 * 全記事を取得する、キャッシュされ、失敗したら黙らない版。
 *
 * `microcms.ts` の getAllBlogs は `cache: "no-store"` を持ち、例外を握り潰して
 * `{contents: [], totalCount: 0}` を返す。記事詳細のように「常に最新」が要る面には
 * それでよいが、全件走査する面（/media/videos・sitemap）で使うと2つ困る。
 *
 * 1. `export const revalidate` が no-store に打ち消され、1リクエストごとに
 *    214記事分を取り直す（本文込みだと実測 2.4MB / 3コール）。microCMS は API 5/5 が満杯で
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

const PAGE = 100;
/** 暴走防止。到達したら黙って切り捨てず気づけるようにする。 */
const MAX_PAGES = 30;

async function page(offset: number, fields: string | undefined, revalidate: number): Promise<BlogsResponse> {
  const qs = new URLSearchParams({
    limit: String(PAGE),
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

/** 全記事。1件でも取れなければ throw する（0件と取得失敗を混同しない）。 */
export async function fetchAllBlogsCached(opts: {
  fields?: string;
  revalidate?: number;
} = {}): Promise<Blog[]> {
  if (!SERVICE_DOMAIN || !API_KEY) {
    throw new Error("microCMS の環境変数が未設定です（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）");
  }
  const revalidate = opts.revalidate ?? ALL_BLOGS_REVALIDATE;
  const all: Blog[] = [];
  const first = await page(0, opts.fields, revalidate);
  all.push(...(first.contents || []));

  const needed = Math.ceil(first.totalCount / PAGE);
  if (needed > MAX_PAGES) {
    console.warn(`[allBlogs] 記事 ${first.totalCount} 件が上限 ${MAX_PAGES * PAGE} 件を超えました。一覧が欠けます。`);
  }
  for (let i = 1; i < Math.min(needed, MAX_PAGES); i++) {
    const res = await page(i * PAGE, opts.fields, revalidate);
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
