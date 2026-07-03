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

export const metadata: Metadata = {
  alternates: { canonical: '/media' },
};

export default function Home() {
  // Figmaデザインに合わせた固定カテゴリ（Headerコンポーネントと同じデータ）
  const categories: Category[] = [
    { id: '2', name: '企業取材', slug: 'company-interview', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '3', name: 'ご利用者様の声', slug: 'user-voices', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '4', name: 'お役立ち情報', slug: 'helpful-info', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
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
