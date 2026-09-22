import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  LpHero,
  LpWorries,
  LpReasons,
  LpPromise,
  LpFlow,
  LpMidCta,
  LpYoutube,
  LpCompare,
  LpFaq,
  LpFinalCta,
  LpStickyCta,
} from '@/components/lp/sections';
import { LpReviews } from '@/components/lp/Reviews';
import LpJobs from '@/components/lp/Jobs';

/**
 * 広告LPは従来どおりリクエスト時レンダリングのままにする。
 * fetch 側をキャッシュした結果このルートはビルド時プリレンダに変わるが、
 * ここは microCMS への呼び出しが多く（記事・求人・ロゴ・担当者）、
 * ビルド時に一斉に叩くとレート制限に当たってビルドが落ちる（ローカル実測: 60秒×3回で失敗）。
 * 転送量の削減は fetch 側の revalidate で得られるので、レンダリング方式は変えない。
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '未経験から始めるタクシー転職｜提携先からプロが無料紹介',
  description:
    '取引実績300社以上。あなたにふさわしいタクシー会社を、専任の担当が無料でご提案します。ご利用者の80%が未経験スタート。関東中心・ほぼ全国対応。まずはお気軽にご相談ください。',
};

export default function LpPage() {
  return (
    <div className="font-sans min-h-screen bg-white">
      <Header />
      <LpHero />
      <LpYoutube />
      <LpWorries />
      <LpReasons />
      <LpCompare />
      <LpJobs />
      <LpPromise />
      <LpFlow />
      <LpMidCta />
      <LpReviews />
      <LpFaq />
      <LpFinalCta />
      <Footer />
      <LpStickyCta />
    </div>
  );
}
