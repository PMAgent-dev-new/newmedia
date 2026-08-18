import { fetchAllBlogsCached, dedupeBySlug, NO_BODY_PAGE } from "@/lib/allBlogs";
import type { Blog } from "@/types/microcms";

/**
 * 記事一覧（/media/blog）のデータ解決とページ計算。
 *
 * これまで一覧は「全214件をクライアントへ渡し、useState で9件だけ描画」していた。
 * 2ページ目以降にURLが存在しないため、サーバーHTMLから辿れる記事は9本しかなく、
 * 用語辞典 word-* 40本を含む63本はサイト内のどこからもリンクされていなかった。
 * ページ番号をURL（/media/blog/page/N）に持たせ、全件をリンクで辿れるようにする。
 */

/**
 * 1ページの件数。24件=3列×8行。
 * 9件のままだと211件が24ページに割れ、ページャの番号窓から外れた奥のページへは
 * 読者もクローラも辿り着けない。24件なら9ページに収まり、全ページ番号を並べられる
 * ＝どの記事も一覧トップから2クリックで届く。
 */
export const BLOG_PAGE_SIZE = 24;

/** 一覧カードに要るフィールドだけ。本文(content/html)を落として取得量を1/100にする。 */
const LIST_FIELDS = "id,title,slug,eyecatch,category,publishedAt,updatedAt,revisedAt";

/** 一覧の基点パス（basePath /media は含めない）。 */
export const BLOG_BASE_HREF = "/blog";

export interface CategorySummary {
  id: string;
  name: string;
  /** URLに使う。microCMS側で未設定なら id にフォールバックする。 */
  slug: string;
  count: number;
}

export interface BlogListPage {
  /** サイドバーに出す、記事が1本以上あるカテゴリ。 */
  categories: CategorySummary[];
  /** カテゴリ一覧のときだけ非null。 */
  category: CategorySummary | null;
  /** このページに載せる記事。 */
  blogs: Blog[];
  /** 絞り込み後の総件数。 */
  totalCount: number;
  currentPage: number;
  totalPages: number;
  /** ページャの基点（/blog または /blog/category/tips）。 */
  baseHref: string;
  /** サイドバーのピックアップ（最新3件）。 */
  pickupArticles: Blog[];
}

/**
 * /blog 直下の静的セグメント。Nextはこれらを [slug] より優先するため、
 * 同名のslugが記事に付くとその記事のURLが一覧に食われて到達不能になる。
 */
const RESERVED_SLUGS = new Set(["page", "category", "preview"]);

/**
 * 一覧に出す全記事（公開日降順）。
 *
 * slug重複のレコードは同一URLを指すのでsitemapと同じ規則で畳む。ここが揃っていないと
 * 「sitemapにあるのに一覧から辿れない記事」が出る。
 */
export async function getBlogList(): Promise<Blog[]> {
  // LIST_FIELDS は本文を含まないので、取得幅は microCMS の上限まで上げてよい
  // （既定は本文つきでも安全な BODY_SCAN_PAGE=25 にしてある）。
  const blogs = dedupeBySlug(
    await fetchAllBlogsCached({ fields: LIST_FIELDS, pageSize: NO_BODY_PAGE }),
  );
  for (const blog of blogs) {
    if (blog.slug && RESERVED_SLUGS.has(blog.slug)) {
      console.warn(`[blogList] slug "${blog.slug}" はルートの予約語です。記事URLが開けません（id=${blog.id}）`);
    }
  }
  return blogs.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

/**
 * 記事が実際に紐づいているカテゴリだけを、件数つきで返す。
 *
 * microCMSのカテゴリAPIには記事0件のカテゴリ（ピックアップ・特殊）も残っているため、
 * そちらを正にすると空の一覧ページへリンクしてしまう。記事側の埋め込みカテゴリを正とする。
 * 並びは件数降順（同数なら名前順）＝読者にとって太い入口が上に来る。
 */
export function summarizeCategories(blogs: Blog[]): CategorySummary[] {
  const map = new Map<string, CategorySummary>();
  for (const blog of blogs) {
    const c = blog.category;
    if (!c?.id) continue;
    const cur = map.get(c.id);
    if (cur) {
      cur.count += 1;
    } else {
      map.set(c.id, { id: c.id, name: c.name || c.id, slug: c.slug || c.id, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));
}

/** カテゴリ一覧のパス。 */
export function categoryHref(category: { slug?: string; id: string }): string {
  return `${BLOG_BASE_HREF}/category/${category.slug || category.id}`;
}

/**
 * URLパラメータからカテゴリを解決する。
 * 旧URL（?category=4）や記事詳細サイドバーからのID指定でも引けるよう、slugとidの両方を見る。
 */
export function findCategory(
  categories: CategorySummary[],
  param: string | undefined | null,
): CategorySummary | undefined {
  if (!param) return undefined;
  return categories.find((c) => c.slug === param || c.id === param);
}

/** 総ページ数（0件でも1ページ扱い。空一覧を404にすると在庫変動でURLが点滅するため）。 */
export function pageCount(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / BLOG_PAGE_SIZE));
}

/** ページャのリンク先。1ページ目は必ず基点URLへ寄せる（/page/1 は作らない）。 */
export function listHref(baseHref: string, page: number): string {
  return page <= 1 ? baseHref : `${baseHref}/page/${page}`;
}

/**
 * ページャに並べる番号。現在ページを中心に最大 max 個。
 * 記事が増えて窓に収まらなくなったら、前後の省略は呼び出し側が先頭/末尾リンクで補う。
 */
export function pageNumbers(currentPage: number, totalPages: number, max = 9): number[] {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  const start = Math.min(Math.max(1, currentPage - half), totalPages - max + 1);
  return Array.from({ length: max }, (_, i) => start + i);
}

/**
 * 一覧ページ1枚分のデータを解決する。
 * 未知のカテゴリ・範囲外のページは null（呼び出し側で notFound()）。
 */
export async function loadBlogListPage(opts: {
  categoryParam?: string | null;
  page: number;
}): Promise<BlogListPage | null> {
  const { categoryParam = null, page } = opts;
  if (!Number.isInteger(page) || page < 1) return null;

  const all = await getBlogList();
  const categories = summarizeCategories(all);

  let category: CategorySummary | null = null;
  if (categoryParam) {
    const found = findCategory(categories, categoryParam);
    if (!found) return null;
    category = found;
  }

  const filtered = category ? all.filter((b) => b.category?.id === category.id) : all;
  const totalPages = pageCount(filtered.length);
  if (page > totalPages) return null;

  const start = (page - 1) * BLOG_PAGE_SIZE;
  return {
    categories,
    category,
    blogs: filtered.slice(start, start + BLOG_PAGE_SIZE),
    totalCount: filtered.length,
    currentPage: page,
    totalPages,
    baseHref: category ? categoryHref(category) : BLOG_BASE_HREF,
    // ピックアップは全体の最新3件。ここで別APIを叩くと no-store が混ざって
    // 一覧ページが毎リクエスト再生成になるため、取得済みの一覧から採る。
    pickupArticles: all.slice(0, 3),
  };
}

/** 見出し・title・パンくずで同じ文言を使うための組み立て。ページ番号は重複コンテンツ回避も兼ねる。 */
export function blogListHeading(category: CategorySummary | null, page: number): string {
  const base = category ? `${category.name}の記事一覧` : '記事一覧';
  return page > 1 ? `${base}（${page}ページ目）` : base;
}

/** meta description。カテゴリと件数が分かる文にして、ページごとに別の説明を持たせる。 */
export function blogListDescription(
  category: CategorySummary | null,
  page: number,
  totalCount: number,
): string {
  const subject = category
    ? `「${category.name}」の記事${totalCount}件`
    : `タクシー・自動車整備士・ドライバー業界の仕事や転職に役立つ記事${totalCount}件`;
  const suffix = page > 1 ? `の${page}ページ目です。` : 'を新着順に掲載しています。';
  return `RIDE JOB Mediaの${subject}${suffix}`;
}

/** ?page=2 のような文字列を1以上の整数へ。解釈できなければ null。 */
export function parsePageParam(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  return Number(raw);
}
