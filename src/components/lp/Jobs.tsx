import { getTopSalaryJobs } from '@/lib/microcms';
import { Job } from '@/types/microcms';
import { BookButton } from './sections';

/**
 * 取扱求人のピックアップ（証拠表示）。
 * 求人ボードではなく「こんな好条件を紹介できる」という一例として少数のみ掲載し、
 * 個別応募ではなく相談・Web面談予約へ誘導する。
 */

function formatSalary(min?: number, max?: number, wageType?: string): string {
  if (!min && !max) return '応相談';
  const prefix = wageType === 'hourly' ? '時給' : '月給';
  if (min && max) return `${prefix} ${min.toLocaleString()}〜${max.toLocaleString()}円`;
  if (min) return `${prefix} ${min.toLocaleString()}円〜`;
  return `${prefix} 〜${max!.toLocaleString()}円`;
}

function formatLocation(
  municipality?: { name: string; prefecture?: { region: string } },
  addressPrefMuni?: string,
): string {
  if (municipality?.name && municipality?.prefecture?.region) {
    return `${municipality.prefecture.region} ${municipality.name}`;
  }
  return addressPrefMuni || '勤務地はご相談ください';
}

function JobCard({ job }: { job: Job }) {
  const jobTitle = job.jobName || job.title || '求人情報';
  const company = job.companyName || '提携タクシー会社';
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.wageType);
  const location = formatLocation(job.municipality, job.addressPrefMuni);
  const tags = job.tags?.slice(0, 3) || [];

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-[#e6eef9] p-6 shadow-[0_2px_8px_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap gap-2 mb-3">
        {job.employmentType && (
          <span className="rounded-full bg-[#eaf3ff] text-[#0a6bb3] text-xs font-bold px-3 py-1">
            {job.employmentType}
          </span>
        )}
        {tags.map((t, i) => (
          <span key={i} className="rounded-full border border-[#e6eef9] text-[#5a6175] text-xs font-bold px-3 py-1">
            {t.name}
          </span>
        ))}
      </div>

      <h3 className="text-[#0b2a44] font-extrabold text-base mb-1">{jobTitle}</h3>
      <div className="text-[#6a7282] text-xs font-medium mb-4">{company}</div>

      <div className="mt-auto space-y-2.5 pt-4 border-t border-[#e6eef9]">
        <div className="flex items-baseline gap-3">
          <span className="text-[#6a7282] text-xs font-bold shrink-0 w-9">給与</span>
          <span className="text-[#f0651f] font-extrabold text-base leading-heading">{salary}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-[#6a7282] text-xs font-bold shrink-0 w-9">勤務地</span>
          <span className="text-[#0b2a44] font-bold text-sm">{location}</span>
        </div>
      </div>
    </div>
  );
}

export default async function LpJobs() {
  let jobs: Job[] = [];
  try {
    // タクシードライバー(6) / ハイヤードライバー(4) のみ、給与の高い順
    const res = await getTopSalaryJobs(3, ['6', '4']);
    jobs = res.contents ?? [];
  } catch {
    jobs = [];
  }
  if (jobs.length === 0) return null; // 取得失敗時はセクションごと非表示

  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="text-[#0a6bb3] font-extrabold tracking-eyebrow text-xs mb-4">JOBS</div>
          <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em]">
            取扱求人の一例
          </h2>
          <p className="text-[#0b2a44] mt-5 font-semibold text-sm md:text-base">
            ほんの一例です。あなたに合う求人は、専門家が条件にあわせて厳選してご提案します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {jobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <BookButton label="あなたに合う求人を相談する" sub="非公開求人のご紹介も・無料" />
          <p className="text-[#6a7282] text-xs font-medium">
            「まだ応募は決めていない」段階でのご相談も歓迎します。
          </p>
        </div>
      </div>
    </section>
  );
}
