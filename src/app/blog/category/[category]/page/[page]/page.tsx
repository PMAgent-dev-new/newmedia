import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BlogListPageView from '@/components/BlogListPageView';
import { withBasePath } from '@/lib/basePath';
import {
  blogListDescription,
  blogListHeading,
  categoryHref,
  findCategory,
  getBlogList,
  listHref,
  loadBlogListPage,
  pageCount,
  parsePageParam,
  summarizeCategories,
} from '@/lib/blogList';

// セグメント設定はリテラルでないとNextが読めない。allBlogs.ts の ALL_BLOGS_REVALIDATE と揃える
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ category: string; page: string }>;
}

/** カテゴリ別一覧の2ページ目以降（/media/blog/category/tips/page/2）。 */
export async function generateStaticParams() {
  const categories = summarizeCategories(await getBlogList());
  return categories.flatMap((c) => {
    const total = pageCount(c.count);
    return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
      category: c.slug,
      page: String(i + 2),
    }));
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: param, page: pageParam } = await params;
  const page = parsePageParam(pageParam);
  if (!page) return { robots: { index: false, follow: false } };

  const categories = summarizeCategories(await getBlogList());
  const category = findCategory(categories, param);
  if (!category) return { robots: { index: false, follow: false } };

  return {
    title: blogListHeading(category, page),
    description: blogListDescription(category, page, category.count),
    alternates: { canonical: withBasePath(listHref(categoryHref(category), page)) },
  };
}

export default async function BlogCategoryPagedPage({ params }: PageProps) {
  const { category: param, page: pageParam } = await params;
  const page = parsePageParam(pageParam);
  if (!page) notFound();

  const categories = summarizeCategories(await getBlogList());
  const category = findCategory(categories, param);
  if (!category) notFound();
  // 1ページ目はカテゴリのトップURLへ、ID指定は正規のslug URLへ寄せる
  if (page === 1) permanentRedirect(categoryHref(category));
  if (category.slug !== param) permanentRedirect(listHref(categoryHref(category), page));

  const data = await loadBlogListPage({ categoryParam: param, page });
  if (!data) notFound();

  return <BlogListPageView data={data} />;
}
