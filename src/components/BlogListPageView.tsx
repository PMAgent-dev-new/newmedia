import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import BlogListSection from '@/components/BlogListSection';
import BlogSidebar from '@/components/BlogSidebar';
import BlogCTASection from '@/components/BlogCTASection';
import { withBasePath } from '@/lib/basePath';
import { BLOG_BASE_HREF, BLOG_PAGE_SIZE, blogListHeading, type BlogListPage } from '@/lib/blogList';
import { absoluteUrl, blogPath, breadcrumbLd, ldJson } from '@/lib/structuredData';

/**
 * 記事一覧ページの見た目。全件／カテゴリ別／2ページ目以降で共通。
 * どのページも同じ構造で描画し、違いは loadBlogListPage が解決した data だけに閉じる。
 */
export default function BlogListPageView({ data }: { data: BlogListPage }) {
  const { category, currentPage, totalPages, blogs, totalCount, baseHref, categories, pickupArticles } = data;
  const heading = blogListHeading(category, currentPage);

  const breadcrumb = breadcrumbLd([
    { name: 'メディアトップ', url: '/' },
    // カテゴリ配下やページ送りでは、親の「記事一覧」を必ず1段挟む
    ...(category || currentPage > 1 ? [{ name: '記事一覧', url: BLOG_BASE_HREF }] : []),
    ...(category && currentPage > 1
      ? [{ name: `${category.name}の記事一覧`, url: baseHref }]
      : []),
    { name: heading },
  ]);

  // 一覧に並んでいる記事をそのまま ItemList で示す（AI検索に一覧の中身を渡す）
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: heading,
    numberOfItems: blogs.length,
    itemListElement: blogs.map((blog, i) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * BLOG_PAGE_SIZE + i + 1,
      name: blog.title,
      url: absoluteUrl(blogPath(blog)),
    })),
  };

  return (
    <div className="font-sans min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListLd) }} />
      <Header />
      <Breadcrumbs pageName={heading} />

      {/* メインコンテンツ - 背景画像付きセクション */}
      <main
        className="min-h-screen"
        style={{
          backgroundImage: `url('${withBasePath('/figma/blue-bg.png')}')`,
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'top left',
        }}
      >
        {/* 白い背景のコンテナ */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <BlogListSection
                blogs={blogs}
                heading={heading}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                baseHref={baseHref}
              />

              {/* サイドバー（デスクトップのみ表示） */}
              <aside className="hidden lg:block lg:order-last">
                <BlogSidebar
                  categories={categories}
                  activeCategoryId={category?.id ?? null}
                  pickupArticles={pickupArticles}
                />
              </aside>
            </div>
          </div>
        </div>
      </main>

      <BlogCTASection />

      <Footer />
    </div>
  );
}
