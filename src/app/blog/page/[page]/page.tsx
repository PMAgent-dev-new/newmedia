import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BlogListPageView from '@/components/BlogListPageView';
import { withBasePath } from '@/lib/basePath';
import {
  BLOG_BASE_HREF,
  blogListDescription,
  blogListHeading,
  getBlogList,
  listHref,
  loadBlogListPage,
  pageCount,
  parsePageParam,
} from '@/lib/blogList';

// セグメント設定はリテラルでないとNextが読めない。allBlogs.ts の ALL_BLOGS_REVALIDATE と揃える
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ page: string }>;
}

/**
 * 記事一覧の2ページ目以降（/media/blog/page/N）。
 *
 * 静的セグメント `page` は `[slug]` より優先されるため、記事URLとは衝突しない
 * （`page` という slug の記事が存在しないことは確認済み）。
 */
export async function generateStaticParams() {
  const total = pageCount((await getBlogList()).length);
  // 1ページ目は /media/blog へ寄せるので生成しない
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = parsePageParam((await params).page);
  if (!page) return { robots: { index: false, follow: false } };

  const data = await loadBlogListPage({ page });
  if (!data) return { robots: { index: false, follow: false } };

  return {
    title: blogListHeading(null, page),
    description: blogListDescription(null, page, data.totalCount),
    alternates: { canonical: withBasePath(listHref(BLOG_BASE_HREF, page)) },
  };
}

export default async function BlogListPagedPage({ params }: PageProps) {
  const page = parsePageParam((await params).page);
  if (!page) notFound();
  // 1ページ目は正規URL（/media/blog）に一本化する
  if (page === 1) permanentRedirect(BLOG_BASE_HREF);

  const data = await loadBlogListPage({ page });
  if (!data) notFound();

  return <BlogListPageView data={data} />;
}
