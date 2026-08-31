import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

type MediaItem = {
  id: string;
  brand: string;
  imagePath: string;
  title: string;
  ctaLabel: string;
  href?: string;
};

const items: MediaItem[] = [
  {
    id: 'venturejp',
    brand: 'ベンチャー.jp',
    imagePath: '/ベンチャーjp.png',
    title: '最高峰のホスピタリティ教育でタクシー業界の新基準を創造',
    ctaLabel: '詳しくはこちら',
    href: 'https://venture.jp/news/2024/11/07/12689/',
  },
  {
    id: 'prtimes',
    brand: 'PR TIMES',
    imagePath: '/prtimes.png',
    title: 'タクシー業界初となる「特定技能ドライバー人材」の入社を支援',
    ctaLabel: '詳しくはこちら',
    href: 'https://prtimes.jp/main/html/rd/p/000000001.000167125.html',
  },
  {
    id: 'stchannel',
    brand: 'スタートアップ応援チャンネル',
    imagePath: '/stachan.png',
    title: '密着ドキュメンタリー「タクシーのホスピタリティ」',
    ctaLabel: '動画を見る',
    href: 'https://www.youtube.com/watch?v=knB0b7Mq_KA&t=139s',
  },
];

export default function MediaCoverage() {
  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em] mb-10">
          メディア取材実績
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col items-center">
              <div className="text-[#0b2a44] text-lg md:text-xl font-extrabold mb-4">
                {item.brand}
              </div>
              <div className="w-full rounded-2xl overflow-hidden bg-white">
                <Image
                  src={withBasePath(item.imagePath)}
                  alt={item.title}
                  width={640}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <h3 className="mt-6 text-center text-[#0b2a44] text-lg md:text-xl font-extrabold leading-relaxed">
                {item.title}
              </h3>
              <div className="mt-6">
                <a
                  href={item.href || '#'}
                  className="inline-flex items-center justify-center rounded-full bg-[#115df2] text-white font-extrabold px-8 py-3 text-sm md:text-base"
                >
                  {item.ctaLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


