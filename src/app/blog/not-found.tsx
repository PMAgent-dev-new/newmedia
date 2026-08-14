import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';

/**
 * /media/blog 配下の404。記事だけでなく、範囲外のページ番号や存在しないカテゴリも
 * ここに来るよう [slug] から1階層上げた（Nextは最も近い not-found を使う）。
 */
export default function NotFound() {
  return (
    <div className="font-sans min-h-screen">
      <Header />
      <Breadcrumbs 
        pageName="ページが見つかりません" 
      />
      
      {/* メインコンテンツ - 背景画像付きセクション */}
      <main 
        className="min-h-screen bg-repeat"
        style={{ backgroundImage: `url('${withBasePath('/figma/blue-bg.png')}')` }}
      >
        {/* 白い背景のコンテナ */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="text-center py-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">ページが見つかりません</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  お探しのページは存在しないか、削除された可能性があります。<br />
                  URLをご確認いただくか、下記のリンクからお戻りください。
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Link 
                  href="/blog"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  記事一覧に戻る
                </Link>
                <Link 
                  href="/"
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  トップページに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}