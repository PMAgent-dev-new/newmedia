import type { Blog, BlogsResponse } from "@/types/microcms";

/**
 * 全記事を取得する、キャッシュされ、失敗したら黙らない版。
 *
 * `microcms.ts` の getAllBlogs は `cache: "no-store"` を持ち、例外を握り潰して
 * `{contents: [], totalCount: 0}` を返す。記事詳細のように「常に最新」が要る面には
 * それでよいが、全件走査する面（/media/videos・sitemap）で使うと2つ困る。
 *
 * 1. `export const revalidate` が no-store に打ち消され、1リクエストごとに
 *    全記事分を取り直す（本文込みで実測 4.67MB／224記事・2026-08-25）。microCMS は API 5/5 が満杯で
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
 * 実測（224記事・2026-08-25）:
 *   limit=100 → 2.01MB/ページ（base64 で 2.68MB）→ 上限超過。これが警告の正体
 *   limit=50  → 1.16MB（1.55MB）→ 今は収まるが、最も長い50本が集まると 2MB を超える
 *   limit=25  → 0.68MB（0.91MB）→ 上限の 43%。最長級の記事(52KB)が25本並んでも 83% で収まる
 *
 * ⚠️ `fields` を絞っても解決しない。本文以外は全記事あわせて35KB（全体の1.8%）しかなく、
 * 容量はほぼ本文そのものだから。効くのはページ幅だけ。
 * 転送量は変わらないが、リクエストが3→9本に増えるぶん全件取得は**遅くなる**
 * （実測 3.9〜4.5秒 → 5.4〜8.9秒。キャッシュバスター付き各3回）。
 * revalidate=3600 で1時間に1回しか走らないので無視できるコストで、
 * キャッシュに載る利益のほうがはるかに大きい。
 * ⚠️ 初版のコメントは「逆に速くなる（10.2秒→3.9秒）」と書いていたが、
 * 測り直すと方向が逆だった。誤った実測値を恒久コメントに残すと、次に触る人が
 * それを根拠に判断してしまう（#17 で警告1行を信じて見逃したのと同じ形）。
 */
export const BODY_SCAN_PAGE = 25;

/**
 * 本文走査に要るフィールドだけ。本文（content/html）とカードの表示項目のみ。
 * 容量への寄与は小さいが、`category` などの参照を展開させない意味はある。
 */
export const BODY_SCAN_FIELDS = "id,title,slug,eyecatch,publishedAt,content,html";

/**
 * 本文を含まない呼び出し（一覧カード・sitemap）が使うページ幅。microCMS の limit 上限。
 *
 * 既定はあえて安全側の BODY_SCAN_PAGE にしてある。取り違えたときの被害が非対称だから:
 * 本文つきなのに100で取ると「警告1行を残してキャッシュが全滅」（#17で実際に起きた）、
 * 本文なしなのに25で取っても「リクエストが数本増える」だけで済む。
 */
export const NO_BODY_PAGE = 100;

/** microCMS の `limit` の上限。ページ幅の検証はこちらを使う（NO_BODY_PAGE を流用しない）。 */
export const MICROCMS_MAX_LIMIT = 100;

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
  const text = await res.text();
  warnIfNearCacheLimit(text.length, offset, pageSize);
  return JSON.parse(text) as BlogsResponse;
}

/** Next のデータキャッシュの上限。1エントリ 2MiB を超えると**一切保存されない**。 */
const CACHE_LIMIT_BYTES = 2 * 1024 * 1024;
/** 上限のこの割合を超えたら警告する。超えてからでは遅いので手前で鳴らす。 */
const CACHE_WARN_RATIO = 0.8;

/**
 * キャッシュ上限に近づいたら気づけるようにする。
 *
 * ⚠️ これが無いと再発しても分からない。#17 では上限超過の唯一の信号が
 * `next build` の警告1行で、誰も読まないまま「キャッシュが一度も効いていない」状態が
 * そのまま本番に出ていた。記事は増え続けるので、いつか必ずまた上限に当たる。
 * body は base64 で保存されるため、生バイト数の 4/3 が実際に載る量になる。
 */
function warnIfNearCacheLimit(rawBytes: number, offset: number, pageSize: number): void {
  const stored = (rawBytes * 4) / 3;
  if (stored < CACHE_LIMIT_BYTES * CACHE_WARN_RATIO) return;
  const over = stored >= CACHE_LIMIT_BYTES;
  console.warn(
    `[allBlogs] ${over ? "データキャッシュの上限を超えています" : "データキャッシュの上限に近づいています"}` +
      `（offset=${offset} limit=${pageSize} / base64換算 ${Math.round(stored / 1024)}KB` +
      ` = 上限の${Math.round((stored / CACHE_LIMIT_BYTES) * 100)}%）。` +
      `${over ? "このページはキャッシュされず毎回取り直しになります。" : ""}` +
      `BODY_SCAN_PAGE を下げてください。`,
  );
}

/**
 * 全記事。1件でも取れなければ throw する（0件と取得失敗を混同しない）。
 *
 * `pageSize` は「1リクエスト＝1キャッシュエントリ」の大きさを決める。既定は本文つきでも
 * Next のデータキャッシュ上限（2MB／エントリ）に収まる BODY_SCAN_PAGE。本文を取らないと
 * 分かっている呼び出しだけ NO_BODY_PAGE へ上げてよい（各定数のコメント参照）。
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
  const pageSize = opts.pageSize ?? BODY_SCAN_PAGE;
  // microCMS は limit=0 を「0件」として200で返す（実測）。throw されないので素通りさせると
  // needed も maxPages も Infinity になり、offset=0 のまま無限にリクエストし続ける。
  // 101以上と負数は400で落ちる（実測）が、失敗の仕方を揃えるため入口でまとめて弾く。
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MICROCMS_MAX_LIMIT) {
    throw new Error(`[allBlogs] pageSize は 1〜${NO_BODY_PAGE} の整数にしてください（受け取った値: ${pageSize}）`);
  }
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
