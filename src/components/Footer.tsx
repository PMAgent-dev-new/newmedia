import { withBasePath } from '@/lib/basePath';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-start pb-[72px] pt-12 px-0 relative w-full"
      data-name="Footer"
      id="node-2064_13"
    >
      <div
        className="box-border content-stretch flex flex-col gap-8 items-start justify-start p-0 relative shrink-0 w-full max-w-[1100px] px-4"
        data-name="Container"
        id="node-2064_14"
      >
        <div
          className="box-border content-stretch flex flex-row gap-4 items-start justify-between p-0 relative shrink-0 w-full"
          data-name="Container"
          id="node-2064_15"
        >
          <div
            className="box-border content-stretch flex flex-row items-center justify-start p-0 relative shrink-0"
            data-name="Container"
            id="node-2064_16"
          >
            <div
              className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
              data-name="Container"
              id="node-2064_17"
            >
              <div
                className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
                data-name="Link"
                id="node-2064_18"
              >
                <div
                  className="box-border content-stretch flex flex-col items-center justify-center p-0 relative shrink-0 w-full"
                  data-name="Container"
                  id="node-2064_19"
                >
                  {/* ロゴ画像をImageで最適化 */}
                  <Image
                    src={withBasePath('/logo-ridejob.png')}
                    alt="RIDE JOB Logo"
                    width={101}
                    height={33}
                    className="h-[33px] w-[101px] object-contain"
                    loading="lazy"
                    sizes="101px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
          data-name="Container"
          id="node-2064_23"
        >
          <div
            className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[22.75px] relative shrink-0 text-[14px] text-gray-600 text-justify w-full"
            id="node-2064_24"
          >
            <p className="block">
              ドライバーの求人をお探しならライドジョブ。あなたにぴったりの求人が見つかります。ドライバー運転・整備・現場に関わる多様な職種を掲載しています。ライドジョブは運転・整備・現場職に携わる方々の、転職・就職を支援する求人サイトです。全国000件の事業所の正社員
              アルバイト
              パート募集情報を掲載しています（2025年7月31日現在）。求人の応募から入職まで専任のキャリアが転職をサポートします。転職・就職なら「ライドジョブ」にお任せください。
            </p>
          </div>
        </div>
        <div
          className="box-border content-stretch flex flex-col gap-8 items-start md:flex-row md:justify-center p-0 relative shrink-0 w-full"
          data-name="Container"
          id="node-2064_25"
        >
          <div
            className="basis-0 box-border content-stretch flex flex-col gap-4 grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0"
            data-name="Container"
            id="node-2064_26"
          >
            <div
              className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
              data-name="Heading 3"
              id="node-2064_27"
            >
              <div
                className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-semibold justify-center leading-[24px] relative shrink-0 text-[16px] text-gray-800 text-left w-full"
                id="node-2064_28"
              >
                <p className="block">ライドジョブについて</p>
              </div>
            </div>
            <div
              className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
              data-name="Container"
              id="node-2064_29"
            >
              <div
                className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
                data-name="Link"
                id="node-2064_36"
              >
                <div
                  className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[20px] relative shrink-0 text-[#130278] text-[14px] text-left w-full"
                  id="node-2064_37"
                >
                  <p className="block">
                    <Link href="/privacy" className="no-underline hover:underline">
                      プライバシーポリシー
                    </Link>
                  </p>
                </div>
              </div>
              <div
                className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
                data-name="Link"
                id="node-2064_36-contact"
              >
                <div
                  className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[20px] relative shrink-0 text-[#130278] text-[14px] text-left w-full"
                  id="node-2064_37-contact"
                >
                  <p className="block">
                    <Link href="/contact" className="no-underline hover:underline">
                      お問い合わせ
                    </Link>
                  </p>
                </div>
              </div>
              <div
                className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
                data-name="Link"
                id="node-2064_38"
              >
                <div
                  className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center leading-[20px] relative shrink-0 text-[#130278] text-[14px] text-left w-full"
                  id="node-2064_39"
                >
                  <p className="block">
                    <a
                      href="https://pmagent.jp/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                    >
                      運営会社情報
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="basis-0 box-border content-stretch flex flex-col gap-10 grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0"
            data-name="Container"
            id="node-2064_42"
          >
            <div
              className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
              id="node-2064_43"
            >
              {/* 採用担当者様へ セクションを削除 */}
            </div>
            <div
              className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
              id="node-2064_49"
            >
              {/* 運営メディア セクションを削除 */}
            </div>
          </div>
          <div
            className="basis-0 box-border content-stretch flex flex-col gap-4 grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0"
            data-name="Container"
            id="node-2064_55"
          >
            <div
              className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
              data-name="Heading 3"
              id="node-2064_56"
            >
            </div>
            <div
              className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
              data-name="Link"
              id="node-2064_58"
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}