import type { MetadataRoute } from "next";
import { fetchAllBlogsCached, dedupeBySlug, SITEMAP_FIELDS } from "@/lib/allBlogs";
import { BASE_PATH } from "@/lib/basePath";

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
  return `${origin}${basePath}${normalized}`;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: buildUrl("/"), lastModified: new Date() },
    { url: buildUrl("/blog"), lastModified: new Date() },
    { url: buildUrl("/videos"), lastModified: new Date() },
    { url: buildUrl("/about"), lastModified: new Date() },
    { url: buildUrl("/privacy"), lastModified: new Date() },
    { url: buildUrl("/contact"), lastModified: new Date() },
  ];

  // getAllBlogs は取得失敗を握り潰して0件を返すため、CMSの一時障害で
  // 記事0本のサイトマップを配ってしまう。失敗したら throw する版を使う。
  // slug重複のレコードは同一URLを指すため畳む（本番sitemapに3件の重複が出ていた）
  const blogs = dedupeBySlug(await fetchAllBlogsCached({ fields: SITEMAP_FIELDS }));

  for (const blog of blogs) {
    const slugOrId = blog.slug || blog.id;
    entries.push({
      url: buildUrl(`/blog/${slugOrId}`),
      lastModified: new Date(blog.updatedAt || blog.publishedAt),
    });
  }

  return entries;
}
