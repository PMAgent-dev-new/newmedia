/**
 * 記事の職種を判定し、応募フォームの着地先を振り分ける。
 *
 * 応募フォーム(ridejob.jp/entry)はパスごとに別のLPで、フォーム側は formOrigin で
 * 投入先の Lark Base を分けている。既定の /entry はタクシー専用LPなので、
 * 全記事のCTAをそこへ向けると整備士記事の読者のリードがタクシーの求職者DBに入る。
 * 見た目だけでなく運用に実害が出るため、記事側で職種を解いて着地先を変える。
 *
 * 方針は「誤爆を出さないこと」。タクシー記事を整備士フォームへ送るくらいなら
 * 既定(=タクシー)のまま置く。判定できない記事は null を返し、現状の /entry を保つ。
 */

import type { Blog } from '@/types/microcms';

/** 応募フォームが用意されている職種。カテゴリではなく記事の主題職種を指す。 */
export type EntryJob = 'mechanic' | 'truck' | 'bus' | 'taxi';

/** 職種ごとの応募フォームURL。本番で実在を確認済み（2026-08-14）。 */
export const ENTRY_URLS: Record<EntryJob, string> = {
  mechanic: 'https://ridejob.jp/entry/mechanic',
  truck: 'https://ridejob.jp/entry/truck',
  bus: 'https://ridejob.jp/entry/bus',
  // /entry はタクシー専用LP。判定できないときの着地先も兼ねる。
  taxi: 'https://ridejob.jp/entry',
};

/** 職種を解決できないときの着地先（＝これまでの挙動）。 */
export const DEFAULT_ENTRY_URL = ENTRY_URLS.taxi;

/**
 * 実際に振り分ける職種。ここに無い職種は判定できても既定（タクシー）へ置く。
 *
 * 全職種を有効にしている。フォーム側を読んだところ truck / bus はタクシーと同じ
 * 求職者DB🚕・同じLark通知先で、変わるのは「マスタ-応募職種」「保有資格」と
 * 通知タイトルだけ（整備士とクーパンだけが別Base）。つまり振り分けても
 * リードの行き先も見る人も変わらず、職種と免許のラベルが正しく付くだけになる。
 * 応募職種マスタに「トラックドライバー」「バスドライバー」が実在することも実査で確認済み。
 */
const ENABLED_JOBS: ReadonlySet<EntryJob> = new Set<EntryJob>(['mechanic', 'truck', 'bus', 'taxi']);

/** CTAの設置場所。Lark側で「記事本文のCTA」と「ヘッダー」を撃ち分けられるようにする。 */
export type EntryPlacement = 'article_cta' | 'header_cta';

/**
 * ルール上は職種が拾えてしまうが、記事の行き先が読者の現職と別なので既定に置く記事。
 * slug ごとに理由を残す（消すときに根拠を辿れるように）。
 */
const UNRESOLVED_SLUGS: Record<string, string> = {
  // 大型二種の転用先がタクシー・送迎・観光バスに割れるため、バスに寄せると外す
  'bus-to-career-change': '転職先が大型二種を活かせる複数職種に割れる',
  // 「タクシーから出る」記事なのでタクシーフォームへ送る根拠がない（既定と同URLだが判定は保留）
  'taxi-to-career-change': '転職先が業界外にも及ぶ',
  // 軽貨物（貨物）とフードデリバリー（業務委託）が混在し、どちらの読者か決まらない
  'gig-delivery-quit': '軽貨物とフードデリバリーの読者が混在',
};

/** 複数職種の読者に同時に向けた記事。職種語を含んでも判定しない。 */
const UNRESOLVED_PATTERNS: RegExp[] = [
  // 「ドライバー・整備士の面接」「整備士・ドライバーの仕事はどう変わる」など
  /ドライバー・整備士/,
  /整備士・ドライバー/,
];

/**
 * 職種の判定ルール。上から順に評価し、最初に当たったものを採る。
 *
 * 順序に意味がある。
 * - mechanic を先頭に置くのは「タクシー整備工場」「タクシー整備一筋30年」のような
 *   企業取材があるため。これらは整備士の記事で、タクシーで拾うと誤爆になる
 * - taxi を truck より前に置くのは「ライドシェア×荷物配送」がライドシェア記事だから。
 *   逆順だと「配送」で貨物に落ちる
 */
const JOB_RULES: ReadonlyArray<{ job: EntryJob; patterns: RegExp[] }> = [
  {
    job: 'mechanic',
    patterns: [
      /整備士/,
      /整備工場/,
      /整備一筋/,
      /整備を極め/,
      /自動車検査員/,
      /エーミング/,
      /ADAS/,
      // 整備士の主要な職場。「ディーラーを辞めたい」「カー用品店で働くとは」も整備士の読者
      /ディーラー/,
      /カー用品店/,
      /バイクショップ/,
    ],
  },
  {
    job: 'taxi',
    patterns: [/タクシー/, /白タク/, /ライドシェア/, /ハイヤー/, /役員運転手/],
  },
  {
    job: 'bus',
    patterns: [/バス運転手/, /路線バス/, /観光バス/, /高速バス/, /バス運転士/, /自動運転バス/],
  },
  {
    job: 'truck',
    patterns: [
      /トラック/,
      // 「ゴミ収集ドライバー」のように本文タイトルに車種が出ず slug にだけ truck が入る記事がある
      /truck/,
      /トレーラー/,
      /タンクローリー/,
      /ダンプ/,
      /キャリアカー/,
      /積載車/,
      /軽貨物/,
      /陸送/,
      /回送/,
      /運送会社/,
      // 宅配・ルート配送・コンビニ配送・チルド配送。フードデリバリー系は当たらない語を選ぶ
      /宅配/,
      /配送/,
      // 貨物車の免許区分。大型二種（バス・タクシー）は含めない
      /大型免許/,
      /中型免許/,
      /準中型/,
      /けん引免許/,
      // トラック・物流の用語辞典クラスタ（slug が word- 始まり）
      /(^|\s)word-/,
    ],
  },
];

/**
 * 記事から職種を解決する。判定できなければ null。
 *
 * カテゴリは使わない。214記事中165件が「お役立ち情報」に入っており職種の手がかりにならず、
 * slug の接頭辞も word-/job-market-/mobility_ のように職種と直交しているため、
 * slug と title の語で判定する。
 */
export function resolveEntryJob(blog: Pick<Blog, 'title'> & { slug?: string }): EntryJob | null {
  const slug = blog.slug ?? '';
  if (slug && UNRESOLVED_SLUGS[slug]) return null;

  const haystack = `${slug} ${blog.title ?? ''}`;
  if (UNRESOLVED_PATTERNS.some((re) => re.test(haystack))) return null;

  for (const rule of JOB_RULES) {
    if (rule.patterns.some((re) => re.test(haystack))) return rule.job;
  }
  return null;
}

/**
 * 記事に対応する応募フォームURL。解決できなければ既定の /entry。
 *
 * UTMを必ず付ける。応募フォームは `window.location.search` から utm_* を読んで
 * Lark へ渡す実装を既に持っている一方、CTAは `rel="noopener noreferrer"` で
 * Referer が落ちるため、**UTM以外にメディア経由だと伝える手段が無い**。
 * 付けないと、記事から来たリードが広告経由・直接流入と Lark 上で区別できず、
 * この施策が効いたかを後から検証できない（自然検索経由の応募0件を潰すのが目的なのに）。
 */
export function entryUrlForBlog(
  blog: Pick<Blog, 'id' | 'title'> & { slug?: string },
  placement: EntryPlacement = 'article_cta',
): string {
  const job = resolveEntryJob(blog);
  const base = job && ENABLED_JOBS.has(job) ? ENTRY_URLS[job] : DEFAULT_ENTRY_URL;
  const params = new URLSearchParams({
    utm_source: 'ridejob_media',
    utm_medium: placement,
    // slug が空のレコードが9件実在するので id にフォールバックする
    utm_content: blog.slug || blog.id || 'unknown',
  });
  return `${base}?${params.toString()}`;
}

/**
 * 「求人を探す」CTAの着地先。記事の職種に対応する求人ハブへ送る。
 *
 * 旧実装は BlogCTASection 内で `https://ridejob.jp/` にハードコードされており、
 * 実測30本すべてがトップページ固定・UTM無しだった（相談CTAだけがUTM付きで、
 * 求人CTAは計測から漏れていた）。読者は記事の職種に興味を持って押しているのに、
 * 全職種混在のトップへ落ちるため、探し直しが発生していた。
 *
 * 着地先は本番で200を確認済み（2026-08-24）。`/jobs` 単体は404なので使わない。
 * 職種を解決できない記事はトップに置く（誤爆で別職種のハブへ送らない。
 * entryUrlForBlog と同じ「判定できないなら既定へ」の方針）。
 */
const JOBS_HUB_URLS: Record<EntryJob, string> = {
  mechanic: 'https://ridejob.jp/jobs/category/car-mechanic',
  truck: 'https://ridejob.jp/jobs/category/truck-driver',
  bus: 'https://ridejob.jp/jobs/category/bus-driver',
  taxi: 'https://ridejob.jp/jobs/category/taxi-driver',
};

/** 職種を解決できないときの着地先（＝これまでの挙動）。 */
export const DEFAULT_JOBS_URL = 'https://ridejob.jp/';

export function jobsUrlForBlog(
  blog: Pick<Blog, 'id' | 'title'> & { slug?: string },
): string {
  const job = resolveEntryJob(blog);
  const base = job && ENABLED_JOBS.has(job) ? JOBS_HUB_URLS[job] : DEFAULT_JOBS_URL;
  const params = new URLSearchParams({
    utm_source: 'ridejob_media',
    utm_medium: 'article_jobs_cta',
    utm_content: blog.slug || blog.id || 'unknown',
  });
  return `${base}?${params.toString()}`;
}
