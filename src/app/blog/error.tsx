'use client';

import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';

/**
 * /media/blog 配下で記事や一覧の取得に失敗したときの画面（HTTP は 500 のまま）。
 * 「見つかりません」と出すと、実在する記事を読者にも検索エンジンにも「無い」と伝えてしまうので、
 * 一時的な失敗として再読み込みを促す。見た目は同じ階層の not-found.tsx に合わせる。
 */
export default function BlogError() {
  return (
    <div className="font-sans min-h-screen">
      <Header />
      <Breadcrumbs
        pageName="ページを表示できませんでした"
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
                <h1 className="text-2xl font-semibold text-gray-700 mb-6">ページを表示できませんでした</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  一時的に記事を読み込めませんでした。<br />
                  時間をおいて、もう一度お試しください。
                </p>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                {/* reset() はサーバー側の取得をやり直さないので、ページごと読み直す */}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  再読み込み
                </button>
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
