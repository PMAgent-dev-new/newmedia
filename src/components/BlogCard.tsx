import Image from 'next/image';
import Link from 'next/link';
import { Blog } from '@/types/microcms';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // カテゴリ名のスタイルを取得
  const getCategoryStyle = (categoryName?: string) => {
    switch (categoryName) {
      case '企業取材':
        return 'bg-[#0066ff] text-white';
      case 'インタビュー':
        return 'bg-[#ff6600] text-white';
      case 'お役立ち情報':
        return 'bg-[#00cc66] text-white';
      case 'ピックアップ':
        return 'bg-[#ff0066] text-white';
      default:
        return 'bg-[#666666] text-white';
    }
  };

  // スラッグがない場合はIDを使用
  const linkHref = blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`;

  return (
    <Link href={linkHref} className="block">
      <div className="bg-white rounded-[12px] shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-black">
        {/* アイキャッチ画像（16:9・文字焼き込みサムネイルが切れないようアスペクト比を画像に一致） */}
        <div className="relative w-full aspect-video bg-[#f5f8ff]">
          {blog.eyecatch?.url ? (
            <Image
              src={blog.eyecatch.url}
              alt={blog.title || '記事画像'}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">画像なし</span>
            </div>
          )}

        </div>

        {/* 記事情報 */}
        <div className="p-3 sm:p-4">
          {/* タイトル */}
          <h3 className="font-bold text-[#333333] text-sm sm:text-base md:text-lg line-clamp-2 mb-2 sm:mb-3 leading-tight">
            {blog.title}
          </h3>

          {/* 日付と会社情報 */}
          <div className="flex items-center justify-between">
            <span className="text-[#666666] text-xs sm:text-sm">
              {formatDate(blog.publishedAt)}
            </span>
            
            {/* 会社情報（将来的に追加する場合） */}
            <div className="flex items-center">
          {/* カテゴリタグ */}
            {blog.category && (
              <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold ${getCategoryStyle(blog.category.name)}`}>
                {blog.category.name}
              </span>
            )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}