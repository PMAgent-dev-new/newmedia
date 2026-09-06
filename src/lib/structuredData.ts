import { BASE_PATH } from '@/lib/basePath';
import type { Blog } from '@/types/microcms';

/** 本番ドメイン。env 未設定でも JSON-LD の絶対URLが壊れないよう本番値をフォールバック。 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ridejob.jp'
).replace(/\/$/, '');

export const SITE_NAME = 'RIDE JOB Media';
export const OPERATOR_NAME = '株式会社PM Agent';
// ⚠️ BASE_PATH は既に "/media"。ここでさらに "/media/" を足すと
//    https://ridejob.jp/media/media/OGP.png となり **404**（本番実測）。
//    publisher.logo と、アイキャッチ無し記事の image フォールバックが
//    全228記事で壊れたURLを指していた。
const LOGO_URL = `${SITE_ORIGIN}${BASE_PATH}/OGP.png`;

/** basePath(/media) を含む絶対URLを組み立てる（canonical / JSON-LD 用） */
export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const withBase = p.startsWith(`${BASE_PATH}/`) || p === BASE_PATH ? p : `${BASE_PATH}${p}`;
  return `${SITE_ORIGIN}${withBase}`;
}

/** HTML本文から meta description を生成（タグ除去→空白正規化→トリム） */
/**
 * 見出しらしい短い断片。description の先頭に来ると検索結果が
 * 「この記事の結論◯◯は…」のように読めなくなる。
 * 実測(2026-08-24 無作為25本): 44%が「この記事の結論」始まりだった。
 */
const HEADING_LABELS = /^(この記事の(結論|要点|まとめ)|結論|まとめ|要点|はじめに|目次)/;

/**
 * HTML本文から meta description を作る。
 *
 * 旧実装は全タグを一括で除去してから先頭140字を切っていたため、
 * 最初の見出しが本文と地続きになって出力されていた。実測の症状は2つ:
 *   ・「この記事の結論移動式クレーンの資格は、…」  ← 見出し＋本文の連結（44%）
 *   ・「荷役とは荷役とは、荷を積む・降ろす…」      ← 見出しと書き出しの重複（吃音）
 * どちらも検索結果でそのまま読まれるので、CTRを直接損ねる。
 *
 * 対策はタグを消す前にブロック境界を区切ること。区切ったうえで、
 * 先頭が「見出しラベル」か「直後の本文が同じ語で始まる見出し」なら捨てて、
 * 最初の実質的な本文から書き始める。
 */
/**
 * 指定字数に収まるよう切り詰める。
 *
 * 単純な slice は語の途中で切れる。実測（2026-09-06）で全240記事の meta description が
 * 「…転職を考えている方に向けて、この記事では実際の年収デ…」のように
 * 名詞の途中で終わっていた。検索結果に出るのはこの文字列そのものなので、
 * 意味が壊れたまま読者の目に触れる。
 *
 * 句点 → 読点・括弧閉じ の順に切断位置を探し、見つからない場合のみ字数で切る。
 * 句点で終われた場合は文として完結しているので「…」は付けない。
 * （jobmadley の truncateForDescription と同じ考え方。両サービスで挙動を揃える）
 */
export const displayWidth = (text: string): number =>
  Array.from(text).reduce((w, c) => {
    const cp = c.codePointAt(0)!
    // 全角として数える範囲。CJK（0x2E80〜）だけを見ていたときは
    // 「※」(U+203B)「★」(U+2605)「…」(U+2026) を半角と数え、上限をわずかに超えていた。
    const wide =
      (cp >= 0x1100 && cp <= 0x115f) || // ハングル字母
      cp === 0x2026 || cp === 0x203b || // … ※
      (cp >= 0x2460 && cp <= 0x24ff) || // ①などの囲み数字
      (cp >= 0x25a0 && cp <= 0x27bf) || // ■ ★ ▲ などの記号・装飾
      (cp >= 0x2e80 && cp <= 0xa4cf) || // CJK・かな・部首
      (cp >= 0xac00 && cp <= 0xd7a3) || // ハングル音節
      (cp >= 0xf900 && cp <= 0xfaff) || // CJK互換漢字
      (cp >= 0xfe30 && cp <= 0xfe6f) || // CJK互換記号
      (cp >= 0xff00 && cp <= 0xff60) || // 全角英数・記号
      (cp >= 0xffe0 && cp <= 0xffe6) || // 全角通貨記号
      (cp >= 0x1f300 && cp <= 0x1faff)  // 絵文字
    // ⚠️ 半角カナ（U+FF61〜U+FF9F）は上の 0xff00-0xff60 に入らないので半角のまま。
    return w + (wide ? 2 : 1)
  }, 0)

/**
 * meta description の表示幅の上限。
 *
 * ⚠️ **文字数ではなく表示幅**（全角=2・半角=1）。検索結果の切り詰めはこの単位で起きる。
 * 以前はここに「140」を**文字数**として渡していた。日本語では幅280＝上限の倍で、
 * 実測（2026-09-06 本番）でも /media/blog/word-nieki が幅271、mobility_5 が幅266だった。
 * jobmadley 側（DESCRIPTION_MAX_WIDTH）と同じ値・同じ単位にしてある。
 */
export const DESCRIPTION_MAX_WIDTH = 140

/**
 * 表示幅の上限に収まるよう整える。収まっていればそのまま返す。
 */
export function fitDescription(text: string, maxWidth: number = DESCRIPTION_MAX_WIDTH): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (displayWidth(trimmed) <= maxWidth) return trimmed
  let width = 0
  let chars = 0
  for (const c of Array.from(trimmed)) {
    const w = displayWidth(c)
    if (width + w > maxWidth) break
    width += w
    chars += 1
  }
  return truncateForDescription(trimmed, chars)
}

export function truncateForDescription(text: string, maxLength: number): string {
  // 「…」で1字使うため、2字未満の予算しか無ければ何も入れない
  if (!text || maxLength < 2) return '';
  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;

  // 末尾の「…」1字ぶんを空けて候補を切り出す
  const head = chars.slice(0, maxLength - 1).join('');
  // 極端に短く切れるのを避けるため、切断位置は候補の後半にある場合のみ採用する
  // 句点は候補の35%以降にあれば採用する（jobmadley と同じ基準）。
  const sentenceEnd = Math.max(
    head.lastIndexOf('。'),
    head.lastIndexOf('！'),
    head.lastIndexOf('？'),
  );
  if (sentenceEnd >= head.length * 0.35) return head.slice(0, sentenceEnd + 1);

  const minCut = head.length / 2;

  // ⚠️ 半角スペースを切断点にしない。「RIDE JOB」の間で切れてブランド名が壊れる。
  const softBreak = Math.max(
    head.lastIndexOf('、'),
    head.lastIndexOf('，'),
    head.lastIndexOf('）'),
    head.lastIndexOf('】'),
    head.lastIndexOf('・'),
  );
  const cut = softBreak >= minCut ? softBreak + 1 : head.length;
  return `${head.slice(0, cut).replace(/[、，・\s]+$/, '')}…`;
}

/**
 * 本文（HTML）から meta description を作る。
 * @param maxWidth **表示幅**の上限（文字数ではない）。既定は DESCRIPTION_MAX_WIDTH。
 */
export function htmlToDescription(
  html?: string,
  fallback = '',
  maxWidth: number = DESCRIPTION_MAX_WIDTH,
): string {
  const src = html || '';
  if (!src) {
    return fitDescription(fallback, maxWidth);
  }

  // ブロック要素の終わりを区切りに変えてから、残りのタグを落とす
  const segments = src
    .replace(/<\/(h[1-6]|p|li|div|section|article|tr|blockquote)>/gi, '\u0001')
    .replace(/<br\s*\/?>/gi, '\u0001')
    .replace(/<[^>]*>/g, '')
    .split('\u0001')
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  while (segments.length > 1) {
    const head = segments[0];
    const next = segments[1];
    // ⚠️ 長さのガードが要る。無いと「結論から言うと、〜」で**始まる**リード文が
    //    見出しラベルと誤判定され、記事の最良の要約（250字）が丸ごと捨てられる。
    //    実測: senior-driver-jobs の description が「一方で、健康診断や深視力…」と
    //    逆接から始まってしまっていた。
    //    正当な見出しラベルの実測最長は20字なので、isEcho と同じ24字で切る。
    const isLabel = head.length <= 24 && HEADING_LABELS.test(head);
    // 「荷役とは」+「荷役とは、…」のように、見出しの語で本文が始まるケース
    const isEcho = head.length <= 24 && next.startsWith(head.replace(/[はとのをがにで]*$/, '').slice(0, 6));
    if (!isLabel && !isEcho) break;
    segments.shift();
  }

  const raw = segments.join(' ').trim() || fallback.replace(/\s+/g, ' ').trim();
  return fitDescription(raw, maxWidth);
}

/** 記事の正規パス（slug優先で id アクセスとの重複を集約） */
export function blogPath(blog: Pick<Blog, 'id' | 'slug'>): string {
  return `/blog/${blog.slug || blog.id}`;
}

export function blogPostingLd(blog: Blog) {
  const url = absoluteUrl(blogPath(blog));
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    // 構造化データの description は検索結果のスニペットではなく、
    // 検索エンジンやAI検索が記事の内容を把握するために読む。SERPの幅制限は掛からないので、
    // meta description（幅140）より広く取る。従来の「160文字」＝およそ幅320に相当。
    description: htmlToDescription(blog.content || blog.html, blog.title, 320),
    image: blog.eyecatch?.url ? [blog.eyecatch.url] : [LOGO_URL],
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.revisedAt || blog.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    /**
     * author は BlogPosting の必須プロパティ（Google「記事」構造化データ）だが、
     * 実測で全221記事に存在しなかった。E-E-A-T の Author 信号が欠落した状態で、
     * AI検索が「誰が書いたか」を判定できない。
     *
     * 個人名は置かない。実在しない執筆者を作るのは E-E-A-T を毀損するうえ、
     * 記事ごとの実際の書き手をシステムが持っていない。運営法人を著者として
     * 明示するのが事実に即している（有料職業紹介事業者としての一次情報が根拠）。
     * 記事単位の監修者が入ったら、ここを Person + reviewedBy に差し替える。
     */
    author: {
      '@type': 'Organization',
      name: OPERATOR_NAME,
      url: `${SITE_ORIGIN}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    ...(blog.category?.name
      ? { articleSection: blog.category.name }
      : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; url?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'ライドジョブメディア',
    url: `${SITE_ORIGIN}${BASE_PATH}`,
    logo: LOGO_URL,
    parentOrganization: {
      '@type': 'Organization',
      name: OPERATOR_NAME,
      url: 'https://pmagent.jp/',
    },
  };
}

export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_ORIGIN}${BASE_PATH}`,
  };
}

/** JSON-LD を <script> に安全に流し込むための文字列化（< をエスケープ） */
export function ldJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

/**
 * 本文HTMLの「よくある質問」セクションから Q&A を抽出する。
 * `<h2>よくある質問</h2>` 以降に並ぶ `<h3>Q. …</h3><p>A. …</p>` のペアを拾う。
 * 該当が無ければ空配列（FAQPage は出力されない）。
 */
export function extractFaqFromHtml(html?: string): { q: string; a: string }[] {
  if (!html) return [];
  const idx = html.indexOf('よくある質問');
  if (idx === -1) return [];
  const section = html.slice(idx);
  const faqs: { q: string; a: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    const q = m[1].replace(/<[^>]*>/g, '').replace(/^Q[.．、:：]?\s*/, '').trim();
    const a = m[2].replace(/<[^>]*>/g, '').replace(/^A[.．、:：]?\s*/, '').trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

/** FAQPage 構造化データ（Q&A が無ければ null） */
export function faqPageLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
