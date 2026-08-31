import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

export default function OurInitiatives() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em] mb-10">
          私たちの取り組み
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: 集客・採用マーケティング */}
          <div className="rounded-2xl bg-[#f3f9ff] p-6 md:p-8">
            <div className="text-[#0a4e86] text-xl md:text-2xl font-extrabold text-center mb-6">
              集客・採用マーケティング
            </div>

            <div className="rounded-2xl bg-white p-5 md:px-2 md:py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                <div className="p-2 md:p-2">
                <div className="inline-block rounded-full bg-[#0a6bb3] px-3 py-1 text-white text-xs font-bold mb-3">
                  伝える
                </div>
                <div className="text-[#0b2a44] text-base font-extrabold mb-2">
                  業界の魅力を発信する専門メディア
                </div>
                <div className="mt-4">
                  <Image
                    src={withBasePath('/media.png')}
                    alt="メディア スクリーンショット"
                    width={380}
                    height={220}
                    className="w-full h-auto rounded-lg border border-[#e6eef9] object-cover"
                  />
                </div>
                <p className="text-[#0d2233] text-sm font-bold mt-4">
                  記事・動画コンテンツで、未経験者にもわかりやすくドライバー業界の情報を届けます。
                </p>
                </div>

                <div className="p-2 md:p-2">
                <div className="inline-block rounded-full bg-[#0a6bb3] px-3 py-1 text-white text-xs font-bold mb-3">
                  つなげる
                </div>
                <div className="text-[#0b2a44] text-base font-extrabold mb-2">
                  業界特化の求人・転職情報サイト
                </div>
                <div className="mt-4">
                  <Image
                    src={withBasePath('/kyuuzin-site.png')}
                    alt="求人サイト スクリーンショット"
                    width={380}
                    height={220}
                    className="w-full h-auto rounded-lg border border-[#e6eef9] object-cover"
                  />
                </div>
                <p className="text-[#0d2233] text-sm font-bold mt-4">
                  勤務地・条件から探しやすい導線設計で、求職者と事業者をスムーズにマッチング。
                </p>
                </div>

                <div className="p-2 md:p-2">
                <div className="inline-block rounded-full bg-[#0a6bb3] px-3 py-1 text-white text-xs font-bold mb-3">
                  集める
                </div>
                <div className="text-[#0b2a44] text-base font-extrabold mb-2">
                  求人広告運用
                </div>
                <div className="mt-4">
                  <Image
                    src={withBasePath('/banner.png')}
                    alt="バナー広告 サンプル"
                    width={380}
                    height={220}
                    className="w-full h-auto rounded-lg border border-[#e6eef9] object-cover"
                  />
                </div>
                <p className="text-[#0d2233] text-sm font-bold mt-4">
                  各種媒体の運用最適化で、応募数の最大化と採用単価の最適化を実現します。
                </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 採用支援 */}
          <div className="rounded-2xl bg-[#f3f9ff] p-6 md:p-8">
            <div className="text-[#0a4e86] text-xl md:text-2xl font-extrabold text-center mb-6">
              採用支援
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-white p-4 border border-[#e6eef9]">
                <div className="inline-block rounded-full bg-[#0a6bb3] px-3 py-1 text-white text-xs font-bold mb-3">
                  顧客開拓
                </div>
                <p className="text-[#0d2233] text-sm font-bold">
                  採用に悩む企業様を新たに開拓し、求人獲得まで伴走します。
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#e6eef9]">
                <div className="inline-block rounded-full bg-[#0a6bb3] px-3 py-1 text-white text-xs font-bold mb-3">
                  面談対応
                </div>
                <ul className="list-disc list-inside text-[#0d2233] text-sm space-y-1 font-bold">
                  <li>求人紹介</li>
                  <li>応募書類の添削・アドバイス</li>
                  <li>面接対策</li>
                  <li>入社前、入社後のフォロー</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[#0a4e86] text-lg md:text-3xl font-extrabold tracking-[0.15rem]">
          採用の戦略構築から運用まで、<br/>業界の課題に特化した採用の仕組みをワンストップで提供します。
        </p>
      </div>
    </section>
  );
}


