import type { MetadataRoute } from "next";
import {
  BLOG_BASE_HREF,
  categoryHref,
  getBlogList,
  listHref,
  pageCount,
  summarizeCategories,
} from "@/lib/blogList";
import { BASE_PATH } from "@/lib/basePath";

/**
 * サイトマップはリクエストのたびに作る（ビルド時に作らせない）。
 *
 * Next 16 の Deployment Adapter（Vercel のビルドが使う）は、ビルド時に作った /sitemap.xml を
 * revalidate を見ずに静的ファイルとして出し、作り直す関数を出さない。fetch の revalidate から
 * `next build` の表示は「1h」になるが、本番はデプロイするまで 9/30 のビルドのままで、10/7 公開の記事が載らなかった。
 * `export const revalidate` を足しても出力は同じ（手元で確認）なので、ISR では直らない。
 *
 * microCMS へは getBlogList の fetch キャッシュ（ALL_BLOGS_REVALIDATE＝1時間）を通る。
 * force-dynamic でも、revalidate を明示した fetch はキャッシュされる（トップページと同じ）ので、
 * 取得のたびに CMS を叩くことはない。新しい記事が載るまでの遅れはこのキャッシュの分
 * （期限が切れたあとの最初の1回は古い内容を返し、裏で取り直す）。
 * ⚠️ cache も revalidate も指定しない fetch は、force-dynamic の下では毎回取り直しになる。
 * ここから呼ぶ取得を足すときは、必ず revalidate を付けること。
 */
export const dynamic = "force-dynamic";

const buildBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { origin, pathname } = new URL(raw);
  const normalizedPathname = pathname === "/" ? "" : pathname.replace(/\/$/, "");
  const basePath = normalizedPathname || BASE_PATH;
  return { origin, basePath };
};

const buildUrl = (path: string) => {
  const { origin, basePath } = buildBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // トップは末尾スラッシュなし。/media/ は /media へ 308 するため、サイトマップに載せるとリダイレクト扱いになる
  if (normalized === "/" && basePath) return `${origin}${basePath}`;
  return `${origin}${basePath}${normalized}`;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: buildUrl("/"), lastModified: new Date() },
    { url: buildUrl(BLOG_BASE_HREF), lastModified: new Date() },
    { url: buildUrl("/videos"), lastModified: new Date() },
    { url: buildUrl("/about"), lastModified: new Date() },
    { url: buildUrl("/privacy"), lastModified: new Date() },
    { url: buildUrl("/contact"), lastModified: new Date() },
  ];

  // 一覧と同じ取得・重複排除を通す。ここがズレると「sitemapにあるのに
  // 一覧から辿れない記事」が生まれる。取得失敗は throw（0件のsitemapを配らない）。
  const blogs = await getBlogList();

  // ページ送りURL（1ページ目は /blog なので2から）
  const totalPages = pageCount(blogs.length);
  for (let page = 2; page <= totalPages; page++) {
    entries.push({ url: buildUrl(listHref(BLOG_BASE_HREF, page)), lastModified: new Date() });
  }

  // カテゴリ別一覧とそのページ送り
  for (const category of summarizeCategories(blogs)) {
    const base = categoryHref(category);
    const pages = pageCount(category.count);
    for (let page = 1; page <= pages; page++) {
      entries.push({ url: buildUrl(listHref(base, page)), lastModified: new Date() });
    }
  }

  for (const blog of blogs) {
    const slugOrId = blog.slug || blog.id;
    entries.push({
      url: buildUrl(`${BLOG_BASE_HREF}/${slugOrId}`),
      lastModified: new Date(blog.updatedAt || blog.publishedAt),
    });
  }

  return entries;
}
