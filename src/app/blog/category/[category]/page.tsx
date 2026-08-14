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
  loadBlogListPage,
  summarizeCategories,
} from '@/lib/blogList';

// セグメント設定はリテラルでないとNextが読めない。allBlogs.ts の ALL_BLOGS_REVALIDATE と揃える
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ category: string }>;
}

/**
 * カテゴリ別の記事一覧（/media/blog/category/tips など）。
 *
 * 旧実装の ?category=4 は165件あっても先頭9件で打ち切られ、残りに到達できなかった。
 * カテゴリ自身をURLにして、そこからページ送りで全件辿れるようにする。
 */
export async function generateStaticParams() {
  const categories = summarizeCategories(await getBlogList());
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: param } = await params;
  const categories = summarizeCategories(await getBlogList());
  const category = findCategory(categories, param);
  if (!category) return { robots: { index: false, follow: false } };

  return {
    title: blogListHeading(category, 1),
    description: blogListDescription(category, 1, category.count),
    alternates: { canonical: withBasePath(categoryHref(category)) },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: param } = await params;

  // 記事詳細サイドバーや旧URL由来のID指定でも引けるようにし、正規のslug URLへ寄せる
  const categories = summarizeCategories(await getBlogList());
  const category = findCategory(categories, param);
  if (!category) notFound();
  if (category.slug !== param) permanentRedirect(categoryHref(category));

  const data = await loadBlogListPage({ categoryParam: param, page: 1 });
  if (!data) notFound();

  return <BlogListPageView data={data} />;
}
