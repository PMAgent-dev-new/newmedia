import { Suspense } from 'react';
import type { Metadata } from 'next';
import { withBasePath } from '@/lib/basePath';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import BlogClientPage from '@/components/BlogClientPage';
import BlogCTASection from '@/components/BlogCTASection';
import { Blog, Category } from '@/types/microcms';
import { getLatestBlogs, getAllCategories } from '@/lib/microcms';

export const metadata: Metadata = {
  title: '記事一覧',
  description:
    'タクシー・自動車整備士・ドライバー業界の仕事や転職に役立つ記事を配信するRIDE JOB Mediaの記事一覧です。',
  // ?category パラメータ付きURLも記事一覧本体へ集約する
  alternates: { canonical: '/media/blog' },
};

export default async function BlogPage() {
  // サーバーサイドでデータ取得
  let blogs: Blog[] = [];
  let categories: Category[] = [];
  let pickupArticles: Blog[] = [];
  let error: string | null = null;

  try {
    // ブログを取得
    try {
      const blogsResponse = await getLatestBlogs(50);
      blogs = blogsResponse.contents || [];
      console.log('Blogs loaded successfully:', blogs.length);
    } catch (blogError) {
      console.error('ブログの取得に失敗しました:', blogError);
    }

    // カテゴリを取得
    try {
      categories = await getAllCategories();
      console.log('Categories loaded successfully:', categories.length);
    } catch (categoryError) {
      console.error('カテゴリの取得に失敗しました:', categoryError);
    }

    // ピックアップ記事: 最新記事3件を取得
    try {
      const pickupResponse = await getLatestBlogs(3);
      pickupArticles = pickupResponse.contents || [];
      console.log('Pickup (latest) articles loaded successfully:', pickupArticles.length);
    } catch (pickupError) {
      console.error('ピックアップ記事（最新3件）の取得に失敗しました:', pickupError);
    }
  } catch (err) {
    console.error('データの取得に失敗しました:', err);
    error = 'データの取得に失敗しました。';
  }

  if (error) {
    return (
      <div className="font-sans min-h-screen bg-gray-50">
        <Header />
        <Breadcrumbs />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen">
      <Header />
      <Breadcrumbs pageName="ブログ一覧" />
      
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
            <Suspense fallback={<div>Loading...</div>}>
              <BlogClientPage blogs={blogs} categories={categories} pickupArticles={pickupArticles} />
            </Suspense>
          </div>
        </div>
      </main>
      
      {/* CTAセクション */}
      <BlogCTASection />
      
      <Footer />
    </div>
  );
}