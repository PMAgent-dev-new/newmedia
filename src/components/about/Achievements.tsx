import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

export default function Achievements() {
  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl text-center font-extrabold tracking-[0.06em] mb-10">
          タクシードライバーに特化した採用サービス
        </h2>

        {/* Head: brand + KPI */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6 md:gap-10 mb-10">
          <div className="relative w-[200px] md:w-[240px] h-[56px] md:h-[64px]">
            <Image
              src={withBasePath('/ridejob_logo.png')}
              alt="RIDE JOB ロゴ"
              fill
              sizes="(min-width: 768px) 240px, 200px"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="text-[#0b2a44] text-xl md:text-3xl font-extrabold">取引実績</div>
            <div className="text-[#101828] font-extrabold leading-none tracking-tight">
              <span className="text-7xl md:text-9xl">300</span>
            </div>
            <div className="text-[#0b2a44] text-xl md:text-3xl font-extrabold">社以上</div>
          </div>
        </div>

        {/* Logos container */}
        <div className="mt-8 rounded-2xl bg-white p-10 md:p-20 shadow-[0_2px_8px_rgba(16,24,40,0.04)]">
          <div className="relative w-full h-auto">
            <Image
              src={withBasePath('/logs.jpg')}
              alt="取引企業ロゴ群"
              width={1200}
              height={360}
              className="w-full h-auto object-contain"
            />
          </div>
          {/* Caption inside container */}
          <p className="mt-8 text-[#0b4f80] text-center text-lg md:text-2xl lg:text-3xl font-extrabold tracking-[0.02em]">
            全国主要都市を中心としタクシー・ハイヤー・バス会社の採用支援
          </p>
        </div>
      </div>
    </section>
  );
}


