export default function AboutHero() {
  return (
    <section
      className="relative w-full"
      aria-label="ビジョン セクション"
      style={{
        background:
          'radial-gradient(1200px 600px at 85% 30%, rgba(0, 149, 255, 0.08), rgba(255,255,255,0) 60%)',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          {/* Left: Big copy */}
          <div className="md:col-span-7">
            <h1 className="text-[#1569a7] font-extrabold leading-[1.3] tracking-[0.5rem]">
              <span className="block text-6xl md:text-7xl lg:text-8xl">新しい価値を</span>
              <span className="block text-6xl md:text-7xl lg:text-8xl">創造し社会を</span>
              <span className="block text-6xl md:text-7xl lg:text-8xl">幸せに</span>
            </h1>
          </div>

          {/* Right: description paragraphs */}
          <div className="md:col-span-5 text-[#0d2233] text-lg md:text-xl lg:text-2xl font-semibold">
            <p className="mb-8">
              わたしたちは、
              世の中の課題・負を当事者となって
              解決していくプロ集団です。
            </p>
            <p className="mb-8">
              積極的に挑戦し、社会に新しい影響力を
              生み出すチャレンジャーとして、
              今よりもっと楽しく、わくわくする、
              そんな素敵な社会にしていきます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}




