import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BlogListPageView from '@/components/BlogListPageView';
import { withBasePath } from '@/lib/basePath';
import {
  BLOG_BASE_HREF,
  categoryHref,
  findCategory,
  getBlogList,
  listHref,
  loadBlogListPage,
  parsePageParam,
  summarizeCategories,
} from '@/lib/blogList';

// セグメント設定はリテラルでないとNextが読めない。allBlogs.ts の ALL_BLOGS_REVALIDATE と揃える
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '記事一覧',
  description:
    'タクシー・自動車整備士・ドライバー業界の仕事や転職に役立つ記事を配信するRIDE JOB Mediaの記事一覧です。',
  alternates: { canonical: withBasePath(BLOG_BASE_HREF) },
};

/**
 * 記事一覧の1ページ目。
 *
 * 旧URLのクエリは実体のあるパスへ寄せる。?category= は検索結果にも残っており、
 * ?page= は「常に1ページ目が返る」死んだパラメータだった。
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: categoryParam, page: pageParam } = await searchParams;

  if (categoryParam) {
    const categories = summarizeCategories(await getBlogList());
    const category = findCategory(categories, categoryParam);
    // 記事0件のカテゴリ（ピックアップ・特殊）を指す旧URLもあるため、
    // 引けないときは404にせず一覧本体へ寄せてパラメータ自体を索引から消す
    permanentRedirect(category ? categoryHref(category) : BLOG_BASE_HREF);
  }

  if (pageParam) {
    const page = parsePageParam(pageParam);
    permanentRedirect(page ? listHref(BLOG_BASE_HREF, page) : BLOG_BASE_HREF);
  }

  const data = await loadBlogListPage({ page: 1 });
  if (!data) notFound();

  return <BlogListPageView data={data} />;
}
