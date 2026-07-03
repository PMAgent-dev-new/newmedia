import { BASE_PATH } from '@/lib/basePath';
import type { Blog } from '@/types/microcms';

/** 本番ドメイン。env 未設定でも JSON-LD の絶対URLが壊れないよう本番値をフォールバック。 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ridejob.jp'
).replace(/\/$/, '');

export const SITE_NAME = 'RIDE JOB Media';
export const OPERATOR_NAME = '株式会社PM Agent';
const LOGO_URL = `${SITE_ORIGIN}${BASE_PATH}/media/OGP.png`;

/** basePath(/media) を含む絶対URLを組み立てる（canonical / JSON-LD 用） */
export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const withBase = p.startsWith(`${BASE_PATH}/`) || p === BASE_PATH ? p : `${BASE_PATH}${p}`;
  return `${SITE_ORIGIN}${withBase}`;
}

/** HTML本文から meta description を生成（タグ除去→空白正規化→トリム） */
export function htmlToDescription(html?: string, fallback = '', max = 140): string {
  const raw = (html || fallback || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
