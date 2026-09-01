import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

type Milestone = {
  year: string;
  title: string;
  description: string;
  imagePath?: string;
};

const milestones: Milestone[] = [
  {
    year: '2019',
    title: '会社設立',
    description:
      'Indeed Japan株式会社を退職後に、採用コンサルティング事業を開始。',
  },
  {
    year: '2020',
    title: 'Indeedと事業提携',
    description:
      'Indeedのパートナーシップ契約を締結し、専属代理店として活動を開始。',
  },
  {
    year: '2021',
    title: 'Indeedから表彰',
    description:
      '最短でシルバーパートナーへと昇格。契約顧客数が100社を超える。',
  },
  {
    year: '2022',
    title: '人材紹介業の開始',
    description:
      '有料職業紹介事業許可を取得し、人材紹介サービスを展開。',
  },
  {
    year: '2023',
    title: '事業譲渡',
    description:
      'Indeedに係る事業を全て同業他社に事業譲渡。',
  },
  {
    year: '2024',
    title: 'RIDE JOB 事業スタート',
    description:
      'タクシードライバーに特化した未経験者の採用支援サービスを開始。',
  },
  {
    year: '2025',
    title: '採用支援展開',
    description:
      '自動車整備士、特定技能などの採用支援領域へ拡大。',
  },
];

export default function CompanyHistory() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em] mb-10">
          これまでの歩み
        </h2>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-[6px] bg-[#1c6ddc]/20 rounded-full" />
            <ul className="relative grid grid-cols-7 gap-6">
              {milestones.map((m) => (
                <li key={m.year} className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <div className="text-[#1780e5] text-3xl font-extrabold tracking-wide">{m.year}</div>
                    <div className="text-[#0b2a44] text-lg font-extrabold mt-2">{m.title}</div>
                  </div>
                  <div className="w-3 h-3 bg-[#1780e5] rounded-full shadow-sm mb-6" />
                  <div className="bg-white border border-[#e6eef9] rounded-xl p-4 shadow-[0_2px_8px_rgba(16,24,40,0.04)]">
                    <p className="text-[#0d2233] text-sm text-left">
                      {m.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden">
          <ul className="relative pl-6">
            <div className="absolute left-3 top-0 bottom-0 w-[6px] bg-[#1c6ddc]/20 rounded-full" />
            {milestones.map((m) => (
              <li key={m.year} className="relative mb-8">
                <div className="absolute -left-[9px] top-2 w-4 h-4 bg-[#1780e5] rounded-full" />
                <div className="text-[#1780e5] text-xl font-extrabold">{m.year}</div>
                <div className="text-[#0b2a44] text-base font-extrabold mt-1">{m.title}</div>
                <p className="text-[#0d2233] text-sm mt-2">
                  {m.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}




