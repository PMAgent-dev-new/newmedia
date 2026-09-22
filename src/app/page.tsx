import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewTopHeroSection from "@/components/NewTopHeroSection";
import CompanyInterviewSection from "@/components/CompanyInterviewSection";
import NewCategorySection from "@/components/NewCategorySection";
import NewJobSection from "@/components/NewJobSection";
import NewInterviewSection from "@/components/NewInterviewSection";
import Footer from "@/components/Footer";
import { Category } from '@/types/microcms';
import type { Metadata } from 'next';

/**
 * トップは従来どおりリクエスト時レンダリングのままにする。
 * fetch 側をキャッシュした結果このルートはビルド時プリレンダに変わるが、
 * ここは microCMS への呼び出しが多く（記事・求人・ロゴ・担当者）、
 * ビルド時に一斉に叩くとレート制限に当たってビルドが落ちる（ローカル実測: 60秒×3回で失敗）。
 * 転送量の削減は fetch 側の revalidate で得られるので、レンダリング方式は変えない。
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/media' },
};

export default function Home() {
  // Figmaデザインに合わせた固定カテゴリ（Headerコンポーネントと同じデータ）
  const categories: Category[] = [
    { id: '2', name: '企業取材', slug: 'company-interview', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '3', name: 'ご利用者様の声', slug: 'user-voice', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '4', name: 'お役立ち情報', slug: 'tips', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '5', name: 'インタビュー', slug: 'interview', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' }
  ];
  return (
    <div className="font-sans min-h-screen">
      <Header />
      <Breadcrumbs />
      <NewTopHeroSection />
      <CompanyInterviewSection />
      <NewCategorySection categories={categories} />
      <NewJobSection />
      <NewInterviewSection />
      <Footer />
    </div>
  );
}
