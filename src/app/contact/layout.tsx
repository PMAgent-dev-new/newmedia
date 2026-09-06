import type { Metadata } from 'next';

/**
 * /media/contact 用のメタデータ。
 *
 * ⚠️ page.tsx が "use client" のため、そちらでは metadata を export できない。
 * layout を挟まないとテンプレートの既定値が出て、メディアトップと title も
 * description も完全に同じ文字列になる（実測で確認）。
 * videos / about / privacy は固有 title を持っており、contact だけ漏れていた。
 */
// ⚠️ ここに「 | RIDE JOB Media」を書かないこと。
//    ルートの layout が template: "%s | RIDE JOB Media" を持っており、二重に付く。
const TITLE = 'お問い合わせ';
const DESCRIPTION =
  'RIDE JOB（ライドジョブ）へのお問い合わせフォームです。採用・掲載のご相談、その他ご質問はこちらから承ります。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: { title: `${TITLE} | RIDE JOB Media`, description: DESCRIPTION, url: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
