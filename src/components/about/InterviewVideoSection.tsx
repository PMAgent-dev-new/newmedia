import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { SectionContainer, WhiteCard } from "./SectionContainer";
import { ActionButton } from "./ActionButton";

interface VideoThumbnailProps {
  src: string;
  alt: string;
}

function VideoThumbnail({ src, alt }: VideoThumbnailProps) {
  return (
    <div className="flex-1 max-w-[100px] md:max-w-[140px]">
      <Image
        src={withBasePath(src)}
        alt={alt}
        width={100}
        height={128}
        className="w-full h-32 md:h-64 object-cover rounded-[8px] md:rounded-[10px]"
        loading="lazy"
        sizes="(max-width: 768px) 100px, 140px"
      />
    </div>
  );
}

export function InterviewVideoSection() {
  const imgFrame2141 = "/figma/interview-video-title.png";
  const imgImage111 = "/figma/video-thumbnail-1.png";
  const imgImage112 = "/figma/video-thumbnail-2.png";
  const imgImage113 = "/figma/video-thumbnail-3.png";

  return (
    <SectionContainer>
      <WhiteCard>
        <div className="flex flex-col gap-5 items-center w-full">
          <Image
            src={withBasePath(imgFrame2141)}
            alt="ビデオタイトル"
            width={180}
            height={32}
            className="w-[180px] md:w-[229px] h-auto object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 180px, 229px"
          />
          
          <p className="font-medium text-sm md:text-base text-center text-gray-800 whitespace-pre-line">
            あなたのお仕事探し
            <br />
            貴方に1番に寄り添う転職エージェント✨
            <br />
            ︎社内の様子や色々な事を動画で発信します
          </p>
          
          <div className="flex gap-1 md:gap-2 w-full justify-center">
            <VideoThumbnail src={imgImage111} alt="ビデオサムネイル1" />
            <VideoThumbnail src={imgImage112} alt="ビデオサムネイル2" />
            <VideoThumbnail src={imgImage113} alt="ビデオサムネイル3" />
          </div>
          
          <ActionButton
            href="https://www.tiktok.com/@ride.job"
            text="RIDE JOB チャンネルへ"
            backgroundColor="#19bbfb"
            ariaLabel="RIDE JOB チャンネルへ（TikTok）"
          />
        </div>
      </WhiteCard>
    </SectionContainer>
  );
}
