import Image from 'next/image';
import { Blog } from '@/types/microcms';

interface PickupArticlesProps {
  articles: Blog[];
}

export default function PickupArticles({ articles }: PickupArticlesProps) {

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  // タイトルが20文字を超える場合は省略記号を追加
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "…";
    }
    return title;
  };

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm">
      <h3 className="text-[#333333] font-bold text-lg mb-4">ピックアップ記事</h3>
      
      <div className="space-y-3">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              {/* 画像 */}
              <div className="relative w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                {article.eyecatch?.url ? (
                  <Image
                    src={article.eyecatch.url}
                    alt={article.title || '記事画像'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">画像</span>
                  </div>
                )}
              </div>
              
              {/* 記事情報 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[#333333] text-sm font-medium line-clamp-2 leading-heading mb-1">
                  {truncateTitle(article.title)}
                </h4>
                <span className="text-[#666666] text-xs">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <span className="text-[#666666] text-sm">ピックアップ記事がありません</span>
          </div>
        )}
      </div>
    </div>
  );
}