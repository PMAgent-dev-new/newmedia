import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

export default function CeoMessage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Left: Text */}
          <div className="md:col-span-6">
            <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em] mb-8">
              <span className="block text-3xl md:text-5xl">「 移動 」を「 サービス 」へ。</span>
              <span className="block text-3xl md:text-5xl">ホスピタリティで社会を変える挑戦。</span>
            </h2>

            <div className="text-[#0d2233] text-base md:text-lg space-y-5 font-semibold">
              <p>
                日本の社会インフラを支えるタクシー業界は、<br/>
                今、大きな転換期を迎えています。
              </p>
              <p>
                現場ではドライバーの高齢化や深刻な人手不足、
                また、長年の経験と勘に頼ったサービスに留まっているのが現状であり、
                業界のイメージを変え、人材を呼び込むことは容易ではありません。
              </p>
              <p>
                私たちは、このタクシー業界の次なる時代を切り拓く挑戦をしています。
                ホスピタリティの概念を導入し、サービスのデジタル化を推し進めることで、本来この業界で最も大切である「人とのつながり」や「やりがい」を解き放つことをミッションとしています。
              </p>
              <p className="pt-2 text-[#0a6bb3] font-extrabold tracking-wider text-lg md:text-xl">
                代表取締役 CEO　梅津 哲豪
              </p>
            </div>
          </div>

          {/* Right: Image */}
          <div className="md:col-span-6">
            <div className="w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={withBasePath('/ceo.png')}
                alt="代表写真"
                width={900}
                height={700}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



