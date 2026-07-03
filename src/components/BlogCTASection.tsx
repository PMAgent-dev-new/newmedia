import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

export default function BlogCTASection() {
  return (
    <section className="py-12 sm:py-16 bg-[#FDEAB1] relative">
      
      <div className="container mx-auto px-4 relative">
        {/* 見出し画像 */}
        <div className="text-center mb-8 sm:mb-12">
          <Image
            src={withBasePath('/figma/heading-cta.png')}
            alt="興味をもったあなたへ"
            width={400}
            height={100}
            className="mx-auto h-auto max-w-full"
          />
        </div>

        {/* CTAカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* 左側カード - キャリア相談 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-[#333333] mb-4 text-center">
              キャリアに悩みの方
            </h3>
            <p className="text-[#666666] text-sm sm:text-base mb-6 text-center leading-relaxed">
              未経験でも安心、面接対策や<br />
              働き方の相談まで丁寧に対応します。
            </p>
            <a href="https://ridejob.jp/entry" target="_blank" rel="noopener noreferrer" className="w-full bg-[#04acdb] hover:bg-[#0398c0] text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 text-lg">
              相談する
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
          </div>

          {/* 右側カード - 求人探し */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-[#333333] mb-4 text-center">
              求人をお探しの方
            </h3>
            <p className="text-[#666666] text-sm sm:text-base mb-6 text-center leading-relaxed">
              希望条件に合う求人情報を掲載。<br />
              気になる仕事を見つけて応募できます。
            </p>
            <a href="https://ridejob.jp/" target="_blank" rel="noopener noreferrer" className="w-full bg-[#2204db] hover:bg-[#1b03b8] text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 text-lg">
              求人を探す
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}