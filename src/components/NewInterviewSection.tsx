import { getAllMembers } from "@/lib/microcms";
import { withBasePath } from "@/lib/basePath";
import { Member } from "@/types/microcms";
import { InterviewStaffSection } from "./about/InterviewStaffSection";
import { InterviewVideoSection } from "./about/InterviewVideoSection";
import { HelpSection } from "./about/HelpSection";

const img = "/figma/interview-section-background.png";

export default async function NewInterviewSection() {
  // メンバーデータを取得
  let members: Member[] = [];
  try {
    const response = await getAllMembers(10);
    members = response.contents || [];
  } catch (error) {
    console.error('メンバーデータ取得エラー:', error);
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start md:px-9 py-[29px] relative size-full">
      {/* 背景画像 */}
      <div
        className="-z-10 absolute inset-0"
        style={{
          backgroundImage: `url(${withBasePath(img)})`,
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center md:px-8 lg:px-16 xl:px-[432px] py-0 relative rounded-tl-[80px] shrink-0 w-full relative z-10">
        <InterviewStaffSection members={members} />
        <InterviewVideoSection />
        <HelpSection />
      </div>
    </div>
  );
}