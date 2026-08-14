import Link from 'next/link';
import { listHref, pageNumbers } from '@/lib/blogList';

interface BlogPaginationProps {
  /** ページャの基点（/blog または /blog/category/tips）。 */
  baseHref: string;
  currentPage: number;
  totalPages: number;
}

const numberClass =
  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors';

/**
 * 記事一覧のページ送り。
 *
 * 以前は <button onClick> でクライアント状態を切り替えるだけだったため、2ページ目以降に
 * URLが無く、サーバーHTMLにも検索エンジンにも1ページ目の9件しか存在しなかった。
 * すべて <Link>（実URL）にして、クリックでもクロールでも同じページに到達できるようにする。
 */
export default function BlogPagination({ baseHref, currentPage, totalPages }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="記事一覧のページ送り" className="mt-8">
      <ul className="flex flex-wrap justify-center items-center gap-2">
        <li>
          {hasPrev ? (
            <Link
              href={listHref(baseHref, currentPage - 1)}
              rel="prev"
              aria-label="前のページ"
              className="px-3 py-2 rounded-lg text-[#0066ff] hover:bg-[#0066ff] hover:text-white transition-colors"
            >
              ‹
            </Link>
          ) : (
            <span aria-hidden="true" className="px-3 py-2 rounded-lg text-gray-400">
              ‹
            </span>
          )}
        </li>

        {/* 番号窓が先頭に届いていないときだけ1ページ目への近道を出す */}
        {pages[0] > 1 && (
          <>
            <li>
              <Link href={listHref(baseHref, 1)} className={`${numberClass} text-[#666666] hover:bg-[#0066ff] hover:text-white`}>
                1
              </Link>
            </li>
            {pages[0] > 2 && (
              <li aria-hidden="true" className="text-[#999999] px-1">
                …
              </li>
            )}
          </>
        )}

        {pages.map((page) => (
          <li key={page}>
            {page === currentPage ? (
              <span aria-current="page" className={`${numberClass} bg-[#0066ff] text-white`}>
                {page}
              </span>
            ) : (
              <Link
                href={listHref(baseHref, page)}
                aria-label={`${page}ページ目`}
                className={`${numberClass} text-[#666666] hover:bg-[#0066ff] hover:text-white`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <li aria-hidden="true" className="text-[#999999] px-1">
                …
              </li>
            )}
            <li>
              <Link
                href={listHref(baseHref, totalPages)}
                className={`${numberClass} text-[#666666] hover:bg-[#0066ff] hover:text-white`}
              >
                {totalPages}
              </Link>
            </li>
          </>
        )}

        <li>
          {hasNext ? (
            <Link
              href={listHref(baseHref, currentPage + 1)}
              rel="next"
              aria-label="次のページ"
              className="px-3 py-2 rounded-lg text-[#0066ff] hover:bg-[#0066ff] hover:text-white transition-colors"
            >
              ›
            </Link>
          ) : (
            <span aria-hidden="true" className="px-3 py-2 rounded-lg text-gray-400">
              ›
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
