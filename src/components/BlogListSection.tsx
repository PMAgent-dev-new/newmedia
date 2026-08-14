import { Blog } from '@/types/microcms';
import BlogCard from './BlogCard';
import BlogPagination from './BlogPagination';

interface BlogListSectionProps {
  /** このページに載せる記事（スライス済み）。 */
  blogs: Blog[];
  /** 見出し。ページ全体の主題なので h1 で出す。 */
  heading: string;
  /** 絞り込み後の総件数。 */
  totalCount: number;
  currentPage: number;
  totalPages: number;
  baseHref: string;
}

/**
 * 記事一覧の本体。
 * 絞り込みもページ送りもURLで決まるため、クライアント状態を持たないサーバーコンポーネント。
 */
export default function BlogListSection({
  blogs,
  heading,
  totalCount,
  currentPage,
  totalPages,
  baseHref,
}: BlogListSectionProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#333333] mb-2">{heading}</h1>
        <p className="text-[#666666] text-sm">
          {totalCount}件の記事
          {totalPages > 1 && `（${currentPage} / ${totalPages}ページ）`}
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">記事が見つかりませんでした</div>
          <p className="text-gray-500 text-sm">条件を変更して再度お試しください</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <BlogPagination baseHref={baseHref} currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
