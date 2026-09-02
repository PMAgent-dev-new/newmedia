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
export function htmlToDescription(html?: string, fallback = '', max = 140): string {
  const src = html || '';
  if (!src) {
    const f = fallback.replace(/\s+/g, ' ').trim();
    return f.length <= max ? f : `${f.slice(0, max)}…`;
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
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max)}…`;
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
    description: htmlToDescription(blog.content || blog.html, blog.title, 160),
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
