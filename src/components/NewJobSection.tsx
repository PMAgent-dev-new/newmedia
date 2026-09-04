import { getLatestJobs } from "@/lib/microcms";
import { withBasePath } from "@/lib/basePath";
import { Job } from "@/types/microcms";
import Image from "next/image";

const imgSection4Job = "/figma/section4-job-bg.png";
const imgHeading042 = "/figma/heading04-2.png";
const imgBxsMap = "/figma/bxs-map.svg";
const imgLucideJapaneseYen = "/figma/lucide-japanese-yen.svg";
const imgMaterialSymbolsWork = "/figma/material-symbols-work.svg";
const imgFrame3 = "/figma/frame-3-arrow.svg";

// デフォルト画像
const defaultJobImage = "/figma/job-image-82.png";

// 給与をフォーマットする関数
function formatSalary(min?: number, max?: number, wageType?: string): string {
  if (!min && !max) return "応相談";
  
  const prefix = wageType === "hourly" ? "時給" : "月給";
  
  if (min && max) {
    return `${prefix} ${min.toLocaleString()}〜${max.toLocaleString()}円`;
  } else if (min) {
    return `${prefix} ${min.toLocaleString()}円〜`;
  } else if (max) {
    return `${prefix} 〜${max.toLocaleString()}円`;
  }
  
  return "応相談";
}

// 勤務地をフォーマットする関数
function formatLocation(municipality?: { name: string; prefecture?: { region: string } }, addressPrefMuni?: string): string {
  if (municipality?.name && municipality?.prefecture?.region) {
    return `${municipality.name} ${municipality.prefecture.region}`;
  }
  if (addressPrefMuni) {
    return addressPrefMuni;
  }
  return "勤務地未設定";
}

// 求人カードコンポーネント
function JobCard({ job }: { job: Job }) {
  const jobImage = job.images?.[0]?.url || defaultJobImage;
  const jobTitle = job.jobName || job.title || "求人情報";
  const companyName = job.companyName || "会社名未設定";
  const location = formatLocation(job.municipality, job.addressPrefMuni);
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.wageType);
  const employmentType = job.employmentType || "雇用形態未設定";
  const tags = job.tags?.slice(0, 3) || [];

  return (
    <div className="flex-1 min-w-0">
      <a 
        href={`https://ridejob.jp/job/${job.id}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${jobTitle} - ${companyName}の求人詳細を見る`}
        className="block no-underline text-inherit hover:opacity-80 transition-opacity duration-200 cursor-pointer"
      >
        <div className="bg-[#ffffff] border-[#333333] border-[1.2px] border-solid rounded-[20px] p-4 h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
          {/* 求人画像をImageで最適化 */}
          <Image
            src={withBasePath(jobImage)}
            alt={jobTitle}
            width={400}
            height={193}
            className="h-[193px] rounded-[10px] w-full object-cover mb-4"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        <div className="flex flex-col gap-2 flex-1">
          <div className="font-bold text-[#101828] text-base break-words">
            {jobTitle}
          </div>
          <div className="font-medium text-neutral-500 text-xs leading-normal pb-1 break-words">
            {companyName}
          </div>
          <div className="flex items-center gap-2 pb-1 border-b border-[#cccccc]">
            <div className="shrink-0 size-4">
              <Image
                src={withBasePath(imgBxsMap)}
                alt="地図アイコン"
                width={16}
                height={16}
                className="size-4"
                loading="lazy"
                sizes="16px"
              />
            </div>
            <div className="font-medium text-neutral-500 text-sm leading-normal break-words flex-1 min-w-0">
              {location}
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1 border-b border-[#cccccc]">
            <div className="shrink-0 size-4">
              <Image
                src={withBasePath(imgLucideJapaneseYen)}
                alt="円アイコン"
                width={16}
                height={16}
                className="size-4"
                loading="lazy"
                sizes="16px"
              />
            </div>
            <div className="font-medium text-neutral-500 text-sm leading-normal break-words flex-1 min-w-0">
              {salary}
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <div className="shrink-0 size-4">
              <Image
                src={withBasePath(imgMaterialSymbolsWork)}
                alt="仕事アイコン"
                width={16}
                height={16}
                className="size-4"
                loading="lazy"
                sizes="16px"
              />
            </div>
            <div className="font-medium text-neutral-500 text-sm leading-normal break-words flex-1 min-w-0">
              {employmentType}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, tagIndex) => (
              <div key={tagIndex} className="border border-[#333333] border-solid rounded-md px-2 py-1 shrink-0">
                <div className="font-medium text-[#333333] text-xs leading-4">
                  {tag.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </a>
    </div>
  );
}

export default async function NewJobSection() {
  let jobs: Job[] = [];
  
  try {
    const jobsResponse = await getLatestJobs(4);
    jobs = jobsResponse.contents;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    // エラーが発生した場合は空配列のまま
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start px-4 md:px-0 py-20 relative size-full">
      {/* 背景画像 */}
      <div
        className="-z-10 absolute inset-0"
        style={{
          backgroundImage: `url(${withBasePath(imgSection4Job)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="box-border content-stretch flex flex-col gap-14 items-center justify-start p-0 relative shrink-0 w-full relative z-10"
        id="node-2161_343"
      >
        <div
          className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0"
          data-name="heading04"
          id="node-2161_312"
        >
          {/* 見出し画像をImageで最適化 */}
          <Image
            src={withBasePath(imgHeading042)}
            alt="求人見出し"
            width={280}
            height={120}
            className="w-[280px] md:w-[383px] h-[120px] md:h-[162px] object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 280px, 383px"
          />
        </div>
        <div
          className="box-border content-stretch flex flex-col gap-10 items-center justify-center px-4 md:px-10 py-0 relative shrink-0 w-full"
          data-name="cardA"
          id="node-2161_193"
        >
          {jobs.length > 0 ? (
            <div className="w-full max-w-7xl">
              {/* モバイル(sm未満)では3件表示 */}
              <div className="sm:hidden grid grid-cols-1 gap-6 w-full">
                {jobs.slice(0, 3).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {/* タブレット以上では4件表示 */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {jobs.slice(0, 4).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          ) : (
            <div className="box-border content-stretch flex flex-col gap-4 items-center justify-center p-8 relative shrink-0 w-full">
              <p className="text-[#666666] text-base font-medium">
                求人情報を取得できませんでした
              </p>
            </div>
          )}
        </div>
        <div
          className="box-border content-stretch flex flex-col gap-12 items-center justify-center p-0 relative shrink-0"
          data-name="btn"
          id="node-2161_306"
        >
          <a
            href="https://ridejob.jp/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="求人検索ページを開く"
            className="block no-underline"
          >
            <div
              className="shadow-[4px_4px_0px_0px_rgba(19,19,19,0.3)] bg-[#027a9c] box-border content-stretch flex flex-row gap-4 items-center justify-center pl-4 md:pl-6 pr-3 md:pr-4 py-3 md:py-4 relative rounded-[58px] shrink-0 hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              data-name="Button"
              id="node-2161_307"
            >
              <div className="absolute border-[#333333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[58px]" />
              <div
                className="flex flex-col font-medium justify-center relative shrink-0 text-[#ffffff] text-base md:text-lg text-center text-nowrap tracking-[0.36px]"
                id="node-2161_308"
              >
                <p className="adjustLetterSpacing block leading-[normal] whitespace-pre">
                  求人をもっと見る
                </p>
              </div>
              <div className="flex h-[31.984px] items-center justify-center relative shrink-0 w-[32px]">
                <div className="flex-none rotate-[270deg]">
                  <Image
                    src={withBasePath(imgFrame3)}
                    alt="矢印アイコン"
                    width={32}
                    height={32}
                    className="size-8"
                    loading="lazy"
                    sizes="32px"
                  />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}