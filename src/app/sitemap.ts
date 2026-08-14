import type { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/microcms";
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

  const limit = 100;
  let offset = 0;
  let total = 0;
  const blogs: Array<{ slug?: string; id: string; updatedAt: string; publishedAt: string }> = [];

  do {
    const response = await getAllBlogs(limit, offset);
    total = response.totalCount;
    blogs.push(...(response.contents || []));
    offset += limit;
  } while (offset < total);

  for (const blog of blogs) {
    const slugOrId = blog.slug || blog.id;
    entries.push({
      url: buildUrl(`/blog/${slugOrId}`),
      lastModified: new Date(blog.updatedAt || blog.publishedAt),
    });
  }

  return entries;
}
