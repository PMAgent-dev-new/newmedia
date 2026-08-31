/**
 * LP専用セクション群。
 * 配色・字組みは /about のコンポーネント（CeoMessage / Achievements / MediaCoverage）に統一。
 *   見出し青: #0a6bb3 / #1569a7   テキスト紺: #0b2a44 / #0d2233 / #101828
 *   セクション背景(淡青): #f3f9ff   CTA: #04acdb(相談) / #115df2
 */

// 各導線の遷移先（実データ）
const BOOK_URL = 'https://leomeet.pmagent.jp/book/ride'; // 自社のWeb面談予約
const LINE_URL = 'https://page.line.me/695pplmd?oat_content=url&openQrModal=true';
const PHONE_DISPLAY = '03-6692-0477';
const PHONE_TEL = 'tel:0366920477';
const PHONE_HOURS = '平日 9:30〜18:30';

const BTN_BASE =
  'group inline-flex flex-col items-center justify-center rounded-full font-extrabold px-8 py-3.5 text-sm md:text-base transition-all duration-200 hover:-translate-y-0.5';

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

/** Web面談予約（メインCTA・水色 #04acdb） */
export function BookButton({ label = '無料で相談する', sub = '1分で完了・履歴書不要' }: { label?: string; sub?: string }) {
  return (
    <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" className={`${BTN_BASE} bg-[#04acdb] text-white shadow-[0_8px_20px_rgba(4,172,219,0.3)] hover:bg-[#0398c0]`}>
      <span className="inline-flex items-center gap-2">{label}<ArrowIcon className="transition-transform group-hover:translate-x-1" /></span>
      <span className="mt-0.5 text-xs font-bold opacity-90">{sub}</span>
    </a>
  );
}

/** LINE相談（緑） */
function LineButton({ sub = 'ともだち追加で気軽に' }: { sub?: string }) {
  return (
    <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className={`${BTN_BASE} bg-[#06c755] text-white shadow-[0_8px_20px_rgba(6,199,85,0.25)] hover:bg-[#05b54d]`}>
      <span className="inline-flex items-center gap-2"><ChatIcon />LINEで相談する</span>
      <span className="mt-0.5 text-xs font-bold opacity-90">{sub}</span>
    </a>
  );
}

/** 電話（白・PCは番号表示／スマホはタップ発信） */
function PhoneButton() {
  return (
    <a href={PHONE_TEL} className={`${BTN_BASE} bg-white text-[#0b2a44] border-[1.5px] border-[#0b2a44] hover:bg-[#0b2a44] hover:text-white`}>
      <span className="inline-flex items-center gap-2"><PhoneIcon /><span className="font-extrabold tracking-wide">{PHONE_DISPLAY}</span></span>
      <span className="mt-0.5 text-xs font-bold opacity-80">今すぐ電話で相談（{PHONE_HOURS}）</span>
    </a>
  );
}

/** 3導線（Web面談予約／LINE／電話）のCTAクラスター */
function CtaCluster({ center = false }: { center?: boolean }) {
  return (
    <div className={`flex flex-col sm:flex-row flex-wrap gap-4 ${center ? 'justify-center' : 'justify-start'}`}>
      <BookButton />
      <LineButton />
      <PhoneButton />
    </div>
  );
}

/* ============================== HERO ============================== */
export function LpHero() {
  return (
    <section
      className="relative w-full border-b border-[#e6eef9]"
      style={{
        background:
          'radial-gradient(1100px 560px at 88% 20%, rgba(0,149,255,0.10), rgba(255,255,255,0) 60%), linear-gradient(180deg,#ffffff 0%,#f3f9ff 100%)',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="max-w-[900px]">
            <div className="inline-flex items-center gap-3 text-[#0a6bb3] font-extrabold tracking-[0.12em] text-xs md:text-sm mb-6">
              <span className="h-px w-7 bg-[#0a6bb3]" />
              未経験から始めるタクシー転職
            </div>
            <h1 className="text-[#1569a7] font-extrabold leading-[1.35] tracking-[0.04em] mb-7">
              <span className="block text-4xl md:text-6xl">タクシー会社選びは、</span>
              <span className="block text-4xl md:text-6xl">
                <span className="relative inline-block">
                  プロにご相談ください
                  <span className="absolute left-0 -bottom-1 h-[6px] w-full bg-[#ffe066]/70 -z-10" />
                </span>
                。
              </span>
            </h1>
            <p className="text-[#0d2233] text-base md:text-lg font-semibold mb-9">
              取引実績300社以上の中から、あなたにふさわしい1社を。
              <br className="hidden md:block" />
              収入・勤務形態・エリアのご希望にあわせ、専任の担当が無料でご提案します。
            </p>
            <CtaCluster />
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b2a44]">
                <span className="text-[#fbbc04] text-sm">★</span>Googleクチコミ高評価多数
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b2a44]">
                <span className="text-[#0a6bb3]">✓</span>未経験スタート80%
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b2a44]">
                <span className="text-[#0a6bb3]">✓</span>相談料0円・履歴書不要
              </span>
            </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== WORRIES ============================== */
export function LpWorries() {
  const worries = [
    '未経験だが、自分にもできる仕事なのか不安がある',
    '歩合制の実態が分からず、稼げる会社の見極め方が分からない',
    '会社の数が多く、どこを選べばよいか判断できない',
    '労働環境のよくない会社は、できれば避けたい',
  ];
  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl text-center font-extrabold tracking-[0.06em] mb-12">
          タクシー転職で、こんなお悩みはありませんか
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[920px] mx-auto">
          {worries.map((w) => (
            <div
              key={w}
              className="flex items-start gap-5 rounded-2xl bg-white border border-[#e6eef9] px-7 py-6 shadow-[0_2px_8px_rgba(16,24,40,0.04)]"
            >
              <span className="text-[#1569a7] font-extrabold text-2xl leading-none shrink-0">Q</span>
              <p className="text-[#0d2233] text-base font-semibold">{w}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-12 text-[#0b2a44] font-extrabold tracking-[0.04em] leading-[1.7]">
          <span className="block text-lg md:inline md:text-2xl">その会社選び、</span>
          <span className="relative inline-block text-2xl text-[#0a6bb3]">
            専門家にお任せいただけます。
            <span className="absolute left-0 -bottom-1 h-[6px] w-full bg-[#ffe066]/70"></span>
          </span>
        </p>
      </div>
    </section>
  );
}

/* ============================== REASONS ============================== */
function IconSupport() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="15" r="8" />
      <path d="M8 42c0-9 7-14 16-14s16 5 16 14" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="9" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFree() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="7" y="14" width="34" height="22" rx="3" />
      <path d="M7 21h34" />
      <circle cx="33" cy="29" r="2.5" />
    </svg>
  );
}

export function LpReasons() {
  const reasons = [
    {
      no: 'REASON 01',
      icon: <IconSupport />,
      title: (
        <>
          未経験でも安心。<br />
          利用者の<span className="text-[#0a6bb3] text-3xl">80%</span>が未経験スタート
        </>
      ),
      body: '二種免許の取得から入社後の不安まで、専任の担当が一人ひとりに伴走します。はじめての業界でも、ゼロから着実にサポートいたします。',
    },
    {
      no: 'REASON 02',
      icon: <IconTarget />,
      title: (
        <>
          取引<span className="text-[#0a6bb3] text-3xl">300</span>社以上から<br />
          専門家が厳選してご提案
        </>
      ),
      body: 'ご希望の収入・勤務形態・エリアに合う会社のみを厳選。求職者には見えにくい「会社の実情」まで把握したうえで、ミスマッチを防ぎます。',
    },
    {
      no: 'REASON 03',
      icon: <IconFree />,
      title: (
        <>
          すべて無料で<br />
          面倒な手続きを代行
        </>
      ),
      body: '面接の日程調整、書類の準備、条件交渉までを代行します。費用は一切いただきません。在職中の方も無理なく転職活動を進められます。',
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl text-center font-extrabold tracking-[0.06em] mb-14">
          ライドジョブが選ばれる<br className="md:hidden" />3つの理由
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 rounded-2xl overflow-hidden border border-[#e6eef9]">
          {reasons.map((r, i) => (
            <div
              key={r.no}
              className={`bg-white p-10 md:p-11 ${i !== 2 ? 'md:border-r border-b md:border-b-0 border-[#e6eef9]' : ''}`}
            >
              <div className="text-[#0a6bb3] font-extrabold text-xs tracking-[0.12em] mb-6">{r.no}</div>
              <div className="w-12 h-12 text-[#0a6bb3] mb-6">{r.icon}</div>
              <h3 className="text-[#0b2a44] font-extrabold text-lg mb-4">{r.title}</h3>
              <p className="text-[#5a6175] text-sm font-medium">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== PROMISE ============================== */
export function LpPromise() {
  const promises = [
    <>まだ転職を決めていない方も歓迎します。<b className="text-white font-extrabold">情報収集だけのご相談でも結構です。</b></>,
    <>ご希望に合わなければ、<b className="text-white font-extrabold">無理に転職をおすすめすることはありません。</b></>,
    <>状況によっては「今は転職を見送るべき」と、<b className="text-white font-extrabold">率直にお伝えする場合もございます。</b></>,
    <>まずはお話を伺うだけで構いません。<b className="text-white font-extrabold">履歴書のご用意も不要です。</b></>,
  ];
  return (
    <section
      className="bg-[#0b2a44]"
      style={{
        background:
          'radial-gradient(900px 500px at 50% -10%, rgba(255,210,51,0.10), rgba(11,42,68,0) 60%), #0b2a44',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 text-[#ffd233] font-extrabold tracking-[0.2em] text-xs mb-5">
            <span className="h-px w-7 bg-[#ffd233]/60" />OUR PROMISE<span className="h-px w-7 bg-[#ffd233]/60" />
          </div>
          <h2 className="text-white text-2xl md:text-5xl font-extrabold tracking-[0.06em]">
            ライドジョブの
            <span className="relative inline-block">
              <span className="text-[#ffd233]">4つ</span>のお約束
              <span className="absolute left-0 -bottom-1 h-[6px] w-full bg-[#ffd233]/40"></span>
            </span>
          </h2>
          <p className="text-[#a9c4de] mt-6 font-semibold text-sm md:text-base">
            転職エージェントは強引なのでは——そうしたご不安に、誠実にお応えします。
          </p>
        </div>
        <ul className="max-w-[920px] mx-auto grid md:grid-cols-2 gap-5">
          {promises.map((p, i) => (
            <li
              key={i}
              className="rounded-2xl bg-white/[0.06] border border-white/15 p-7 md:p-8 transition-colors hover:bg-white/[0.1]"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#ffd233] text-[#0b2a44] font-extrabold text-lg shrink-0 shadow-[0_4px_12px_rgba(255,210,51,0.3)]">
                  0{i + 1}
                </span>
                <span className="text-[#ffd233] font-extrabold tracking-[0.18em] text-xs">PROMISE</span>
              </div>
              <p className="text-[#e6eef7] text-base font-medium">{p}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================== FLOW ============================== */
export function LpFlow() {
  const steps = [
    { n: 1, t: ['無料相談', '(LINE・電話)'] },
    { n: 2, t: ['ご希望を', 'ヒアリング'] },
    { n: 3, t: ['300社から', '求人をご提案'] },
    { n: 4, t: ['面接対策・', '日程調整を代行'] },
    { n: 5, t: ['入社・', 'その後もフォロー'] },
  ];
  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="text-[#0a6bb3] font-extrabold tracking-[0.18em] text-xs mb-4">FLOW</div>
          <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em]">ご利用の流れ</h2>
          <p className="text-[#0b2a44] mt-5 font-semibold text-sm md:text-base">
            ご相談から入社後のフォローまで、すべて無料でご利用いただけます。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative flex md:flex-col items-center gap-5 md:gap-0 rounded-2xl bg-white border border-[#e6eef9] px-6 md:px-4 py-6 md:py-8 text-left md:text-center"
            >
              <div className="shrink-0 w-12 h-12 rounded-full border-[1.5px] border-[#0a6bb3] text-[#0a6bb3] flex items-center justify-center font-extrabold text-xl md:mb-4">
                {s.n}
              </div>
              <h4 className="text-[#0b2a44] font-extrabold text-sm md:text-base">
                {s.t.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== YOUTUBE ============================== */
const YT_CHANNEL_URL = 'https://www.youtube.com/@RIDEJOB%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB';

function PlayIcon() {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

export function LpYoutube() {
  const videos = [
    { id: 'kyahGy1pfMw', title: '【保存版】タクシー業界で働くメリット5選を徹底解説！！' },
    { id: 'jMrdKwFpZLk', title: '【30〜50代必見】タクシー転職面談で「実際に聞かれること」全部教えます！※無理な勧誘は一切なし' },
    { id: 'oW9nu-Kt7H0', title: '【実録】50代工場勤務のタクシー転職の面談に潜入！' },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="text-[#0a6bb3] font-extrabold tracking-[0.18em] text-xs mb-4">MOVIE</div>
          <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em]">
            動画でわかる<br />タクシー転職のリアル
          </h2>
          <p className="text-[#0b2a44] mt-5 font-semibold text-sm md:text-base">
            実際の転職者インタビューや面談の様子を、YouTubeチャンネルで公開しています。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {videos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl overflow-hidden bg-white border border-[#e6eef9] shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_10px_28px_rgba(16,24,40,0.12)]"
            >
              <div className="relative aspect-video bg-[#0b2a44] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <PlayIcon />
              </div>
              <div className="p-6">
                <h3 className="text-[#0b2a44] font-extrabold text-sm line-clamp-2 min-h-[3em]">
                  {v.title}
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 text-[#0a6bb3] font-extrabold text-xs">
                  動画を見る
                  <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={YT_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-[#FF0000] text-white font-extrabold px-9 py-4 text-sm md:text-base shadow-[0_8px_20px_rgba(255,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#e60000]"
          >
            <svg width="26" height="19" viewBox="0 0 30 21" fill="none" aria-hidden>
              <path d="M29.52 3.28c-.346-1.297-1.366-2.317-2.663-2.663C24.485 0 15.06 0 15.06 0S5.635 0 3.263.617c-1.297.346-2.317 1.366-2.663 2.663C0 5.652 0 10.5 0 10.5s0 4.848.6 7.22c.346 1.297 1.366 2.317 2.663 2.663C5.635 21 15.06 21 15.06 21s9.425 0 11.797-.617c1.297-.346 2.317-1.366 2.663-2.663.6-2.372.6-7.22.6-7.22s0-4.848-.6-7.22zM12.048 15V6l7.872 4.5-7.872 4.5z" fill="white" />
            </svg>
            チャンネルを見る
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================== COMPARE ============================== */
export function LpCompare() {
  const rows = [
    ['会社の比較', '300社規模から厳選提案', '自力で1社ずつ', 'good', 'mid'],
    ['会社の実情', '専門家が把握', '入社まで不明', 'good', 'bad'],
    ['未経験サポート', '免許取得から伴走', 'すべて自分で', 'good', 'bad'],
    ['面接・日程調整', 'すべて代行', '自分で対応', 'good', 'mid'],
    ['費用', '完全無料', '無料', 'good', 'good'],
  ];
  const mark = (k: string) =>
    k === 'good' ? <span className="text-[#0a6bb3] font-extrabold text-lg mr-1.5">◎</span>
    : k === 'mid' ? <span className="text-[#8a91a6] font-extrabold mr-1.5">△</span>
    : <span className="text-[#8a91a6] font-extrabold mr-1.5">×</span>;
  return (
    <section className="bg-[#f3f9ff]">
      <div className="mx-auto max-w-[860px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl text-center font-extrabold tracking-[0.06em] mb-12">
          ご自身で探す場合との比較
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[#e6eef9] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-[#8a91a6] text-white font-extrabold p-4" />
                <th className="bg-[#0b2a44] text-white font-extrabold p-4">ライドジョブ</th>
                <th className="bg-[#aab2c4] text-white font-extrabold p-4">ご自身で探す</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r[0]} className={i !== rows.length - 1 ? 'border-b border-[#e6eef9]' : ''}>
                  <th className="text-left bg-[#fafbfd] text-[#0b2a44] font-extrabold p-4">{r[0]}</th>
                  <td className="bg-[#f5f9ff] text-[#0b2a44] font-bold text-center p-4">{mark(r[3])}{r[1]}</td>
                  <td className="text-center text-[#5a6175] p-4">{mark(r[4])}{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ============================== FAQ ============================== */
export function LpFaq() {
  const faqs = [
    ['本当に無料で利用できますか。', 'はい、ご相談から入社まですべて無料です。費用は提携先の企業からいただく仕組みのため、求職者の方に料金が発生することは一切ございません。'],
    ['未経験・二種免許なしでも利用できますか。', '問題ございません。ご利用者の80%が未経験スタートです。二種免許の取得方法や、費用補助のある会社のご案内など、ゼロから丁寧にサポートいたします。'],
    ['強引に勧誘されることはありませんか。', 'ご安心ください。無理に転職をおすすめすることはありません。状況によっては「今は転職を見送るべき」と率直にお伝えする場合もございます。情報収集のみのご相談も歓迎します。'],
    ['すぐの転職でなくても相談できますか。', 'もちろんです。「少し興味がある」「将来的に考えている」という段階でのご相談も歓迎いたします。お客様のペースに合わせてサポートします。'],
    ['関東以外でも紹介してもらえますか。', '関東エリアを中心に多数の求人をご用意しておりますが、四国・東北を除くエリアでもご紹介が可能です。まずはご希望のエリアをお聞かせください。'],
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[860px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-[#0a6bb3] text-2xl md:text-4xl text-center font-extrabold tracking-[0.06em] mb-12">
          よくあるご質問
        </h2>
        <div className="rounded-2xl border border-[#e6eef9] overflow-hidden divide-y divide-[#e6eef9]">
          {faqs.map(([q, a]) => (
            <details key={q} className="group bg-white">
              <summary className="flex items-start gap-4 cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-[#0a6bb3] font-extrabold shrink-0">Q</span>
                <span className="text-[#0b2a44] font-extrabold text-base flex-1">{q}</span>
                <span className="shrink-0 mt-1 w-3 h-3 border-r-2 border-b-2 border-[#8a91a6] rotate-45 transition-transform group-open:rotate-[225deg]" />
              </summary>
              <div className="flex items-start gap-4 px-6 pb-6 -mt-1">
                <span className="text-[#8a91a6] font-extrabold shrink-0">A</span>
                <p className="text-[#5a6175] text-sm font-medium">{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== MID CTA ============================== */
export function LpMidCta() {
  return (
    <section className="bg-[#0b2a44]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-14 md:py-16 text-center">
        <h3 className="text-white text-xl md:text-2xl font-extrabold tracking-[0.04em]">
          まずは「話を聞くだけ」でも大丈夫です。
        </h3>
        <p className="text-[#bcd2e6] font-semibold text-sm mt-3">
          無料・履歴書不要・1分で完了。無理な勧誘はいたしません。
        </p>
        <div className="mt-8">
          <CtaCluster center />
        </div>
      </div>
    </section>
  );
}

/* ============================== FINAL CTA ============================== */
export function LpFinalCta() {
  return (
    <section
      className="text-center"
      style={{ background: 'linear-gradient(160deg,#0b2a44 0%,#0a4e86 100%)' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <h2 className="text-white text-2xl md:text-4xl font-extrabold tracking-[0.04em] mb-5">
          あなたにふさわしいタクシー会社を、<br />
          <span className="relative inline-block">
            専門家が無料でお探しします。
            <span className="absolute left-0 -bottom-1 h-[5px] w-full bg-[#ffd233]/70" />
          </span>
        </h2>
        <p className="text-[#bcd2e6] font-semibold mb-10 text-sm md:text-base">
          まずはお気軽に、LINEまたはお電話でご相談ください。履歴書は不要・1分で完了します。
        </p>
        <CtaCluster center />
      </div>
    </section>
  );
}

/* ============================== STICKY CTA (mobile) ============================== */
export function LpStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden flex gap-2.5 p-3 bg-white/95 backdrop-blur border-t border-[#e6eef9] shadow-[0_-2px_14px_rgba(13,21,48,0.12)]">
      <a
        href={PHONE_TEL}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0b2a44] text-white font-extrabold py-3.5 text-sm"
      >
        <PhoneIcon />電話する
      </a>
      <a
        href={BOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#04acdb] text-white font-extrabold py-3.5 text-sm"
      >
        <ArrowIcon />無料相談
      </a>
    </div>
  );
}
