import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

type BusinessItem = {
  id: string;
  brandLabel: string;
  brandColor: string; // text color class
  brandLogoPath?: string;
  title: string;
  since: string;
  bullets: { heading: string; body: string }[];
  imagePath?: string;
};

const items: BusinessItem[] = [
  {
    id: 'ridejob',
    brandLabel: 'RIDE JOB',
    brandColor: 'text-[#1b5cff]',
    brandLogoPath: '/ridejob_logo.png',
    title: 'タクシードライバーに特化した採用支援サービス',
    since: '2024.01~',
    bullets: [
      {
        heading: '総合的な採用支援',
        body:
          '人材集客から面談対応、入社後の定着フォローまで一貫したサービスを提供。',
      },
      {
        heading: '独自の採用プラットフォーム',
        body:
          '求人サイトとメディアを運営し、未経験者を含む幅広い層にアプローチ。',
      },
    ],
    imagePath: '/r-business-ov.png',
  },
  {
    id: 'global',
    brandLabel: 'RIDE JOB Global',
    brandColor: 'text-[#e91e63]',
    brandLogoPath: '/ridejob_global_logo.png',
    title: '特定技能人材の採用支援',
    since: '2024.12~',
    bullets: [
      {
        heading: '',
        body: '外国人ドライバー、自動車整備士の採用をサポート。',
      },
    ],
    imagePath: undefined,
  },
  {
    id: 'mechanic',
    brandLabel: 'RIDE JOB Mechanic',
    brandColor: 'text-[#30c036]',
    brandLogoPath: '/ridejob_mechanic_logo.png',
    title: 'メカニック業界の人材紹介',
    since: '2025.01~',
    bullets: [
      { heading: '', body: '自動車整備士、機械整備士などの採用をサポート。' },
    ],
    imagePath: undefined,
  },
];

export default function BusinessOverview() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em] mb-10">
          事業概要
        </h2>

        <div className="flex flex-col">
          {items.map((item, idx) => (
            <div key={item.id} className="py-8">
              {idx !== 0 && <div className="h-px w-full bg-[#cfe0f5] mb-8" />}

              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6 md:gap-8">
                {/* Left: Brand */}
                <div className="md:col-span-3">
                  {item.brandLogoPath ? (
                    <div className="flex flex-col items-start">
                      <div className="relative w-[200px] md:w-[240px] h-[56px] md:h-[64px]">
                        <Image
                          src={withBasePath(item.brandLogoPath)}
                          alt={item.brandLabel}
                          fill
                          sizes="(min-width: 768px) 240px, 200px"
                          className="object-contain"
                          priority={item.id === 'ridejob'}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`font-extrabold text-3xl md:text-4xl ${item.brandColor}`}>
                        {item.brandLabel}
                      </div>
                    </>
                  )}
                </div>

                {/* Center: Content */}
                <div className={item.id === 'ridejob' ? "md:col-span-7" : "md:col-span-9"}>
                  <div className="flex flex-wrap items-baseline gap-4 mb-4">
                    <h3 className="text-[#0b2a44] text-xl md:text-3xl font-extrabold tracking-[0.02em]">
                      {item.title}
                    </h3>
                    <span className="text-[#64748b] text-sm md:text-base font-bold">
                      {item.since}
                    </span>
                  </div>

                  <div className="space-y-5">
                    {item.bullets.map((b, i) => (
                      <div key={i}>
                        {b.heading && (
                          <div className="text-[#0b2a44] text-base md:text-lg font-extrabold mb-1">
                            {b.heading}
                          </div>
                        )}
                        <p className="text-[#0d2233] text-sm md:text-base">
                          {b.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Image */}
                {item.id === 'ridejob' && (
                  <div className="md:col-span-2 hidden md:flex justify-end">
                    {item.imagePath && (
                      <Image
                        src={withBasePath(item.imagePath)}
                        alt="サービス画像"
                        width={260}
                        height={160}
                        className="object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


