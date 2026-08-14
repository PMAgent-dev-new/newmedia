import { getLogos } from "@/lib/microcms";
import { FEATURED_COMPANY_BY_LOGO_ID, companyJobsUrl } from "@/constants/featuredCompanies";

export default async function LogoMarquee() {
  const res = await getLogos(30);
  const logos = res.contents || [];

  if (!logos.length) return null;

  // 無限スクロールのため2周分に展開
  const looped = [...logos, ...logos];

  return (
    <section aria-label="企業ロゴ" className="w-full">
      <div className="w-full bg-white border-t border-b border-black/10 py-6">
        <div className="logo-marquee overflow-hidden">
          <div className="logo-marquee__track flex items-center gap-10 md:gap-14">
            {looped.map((item, idx) => {
              const company = FEATURED_COMPANY_BY_LOGO_ID[item.id];
              const isClone = idx >= logos.length;
              const image = (
                <img
                  src={item.logo?.url || ''}
                  alt={isClone ? '' : company ? `${company.name}の求人` : (item.company || '企業ロゴ')}
                  className="h-10 md:h-12 lg:h-14 w-auto object-contain"
                  loading={idx < 6 ? 'eager' : 'lazy'}
                />
              );

              // 2周目はアニメーション継続用の複製。重複リンク・読み上げを避ける。
              if (isClone || !company) {
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="shrink-0 opacity-80"
                    aria-hidden={isClone || undefined}
                  >
                    {image}
                  </div>
                );
              }

              return (
                <a
                  key={`${item.id}-${idx}`}
                  href={companyJobsUrl(company.slug)}
                  className="shrink-0 rounded-sm opacity-80 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                  aria-label={`${company.name}の求人を見る`}
                >
                  {image}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

