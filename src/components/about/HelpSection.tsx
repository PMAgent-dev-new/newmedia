import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { SectionContainer } from "./SectionContainer";

interface HelpCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  href: string;
  ariaLabel: string;
}

function HelpCard({ title, description, buttonText, buttonColor, href, ariaLabel }: HelpCardProps) {
  const imgGroup3 = "/figma/arrow-icon.svg";

  return (
    <div className="bg-white rounded-2xl border-[1.2px] border-[#333333] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
      <div className="flex flex-col-reverse">
        <div className="px-4 py-8 text-center">
          <h3 className="font-bold text-[24px] md:text-[32px] text-gray-800 mb-4 leading-[1.1]">
            {title}
          </h3>
          <p className="font-medium text-[#333333] text-[14px] md:text-[16px] leading-[1.6] whitespace-pre-line">
            {description}
          </p>
        </div>
        
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="block w-full"
        >
          <div
            className="flex items-center justify-center gap-4 py-6 md:py-[30px] px-6 md:px-12 rounded-t-2xl border-[1.5px] border-[#333333] hover:opacity-90 transition-opacity duration-200"
            style={{ backgroundColor: buttonColor }}
          >
            <p className="font-extrabold text-white text-[24px] md:text-[32px] leading-none">
              {buttonText}
            </p>
            <div className="rotate-[270deg]">
              <Image
                src={withBasePath(imgGroup3)}
                alt="矢印アイコン"
                width={36}
                height={36}
                className="size-9"
                loading="lazy"
                sizes="36px"
              />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

export function HelpSection() {
  const imgHeading051 = "/figma/troubled-you-heading.png";

  return (
    <SectionContainer>
      <Image
        src={withBasePath(imgHeading051)}
        alt="困ったあなたへ見出し"
        width={260}
        height={140}
        className="w-[260px] md:w-[346px] h-auto object-contain"
        loading="lazy"
        sizes="(max-width: 768px) 260px, 346px"
      />
      
      <HelpCard
        title="キャリアにお悩みの方"
        description="未経験でも安心。面接対策や
働き方の相談まで丁寧に対応します。"
        buttonText="相談する"
        buttonColor="#19bbfb"
        href="https://ridejob.jp/entry"
        ariaLabel="相談する"
      />
      
      <HelpCard
        title="求人をお探しの方"
        description="希望条件に合う求人情報を掲載。
気になる仕事を見つけて応募できます。"
        buttonText="求人を探す"
        buttonColor="#2204db"
        href="https://ridejob.jp/"
        ariaLabel="求人を探す（外部サイト）"
      />
    </SectionContainer>
  );
}
