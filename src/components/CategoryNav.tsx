import Link from 'next/link';
import { BLOG_BASE_HREF, categoryHref, type CategorySummary } from '@/lib/blogList';

interface CategoryNavProps {
  categories: CategorySummary[];
  /** 表示中のカテゴリID（全記事一覧では null）。 */
  activeCategoryId?: string | null;
}

/**
 * カテゴリの入口。
 *
 * 以前はトグルスイッチでクライアント側の絞り込み状態を切り替えるだけで、
 * カテゴリごとの一覧に実URLが無かった（?category= は付いても常に先頭9件）。
 * 各カテゴリを固有URLの <Link> にして、そのカテゴリの全件までクロールできるようにする。
 */
export default function CategoryNav({ categories, activeCategoryId = null }: CategoryNavProps) {
  const itemClass =
    'flex items-center justify-between gap-2 px-3 py-2 rounded-[8px] text-sm transition-colors';

  return (
    <nav aria-label="カテゴリ" className="bg-white rounded-[12px] p-4 shadow-sm">
      <h2 className="text-[#333333] font-bold text-lg mb-4">カテゴリから探す</h2>

      <ul className="space-y-1">
        <li>
          <Link
            href={BLOG_BASE_HREF}
            aria-current={activeCategoryId === null ? 'page' : undefined}
            className={`${itemClass} ${
              activeCategoryId === null
                ? 'bg-[#0066ff] text-white font-bold'
                : 'text-[#333333] hover:bg-[#eaf2ff]'
            }`}
          >
            <span>すべての記事</span>
          </Link>
        </li>

        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <li key={category.id}>
              <Link
                href={categoryHref(category)}
                aria-current={isActive ? 'page' : undefined}
                className={`${itemClass} ${
                  isActive
                    ? 'bg-[#0066ff] text-white font-bold'
                    : 'text-[#333333] hover:bg-[#eaf2ff]'
                }`}
              >
                <span className="min-w-0 break-words">{category.name}</span>
                <span className={`shrink-0 text-xs ${isActive ? 'text-white/80' : 'text-[#999999]'}`}>
                  {category.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
