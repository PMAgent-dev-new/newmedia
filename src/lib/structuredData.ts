import { Blog } from "@/types/microcms";

/**
 * 記事詳細ページの構造化データ（schema.org JSON-LD）ビルダー。
 * SEO/AIO 向けに BlogPosting / BreadcrumbList / FAQPage を生成する。
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ridejob.jp").replace(/\/$/, "");
const MEDIA_BASE = `${SITE_URL}/media`;

const PUBLISHER = {
  "@type": "Organization",
  name: "RIDE JOB",
  logo: {
    "@type": "ImageObject",
    url: `${MEDIA_BASE}/ridejob_logo.png`,
  },
} as const;

/** 記事の正規URL（slug 優先、無ければ id） */
export function blogUrl(blog: Blog): string {
  return `${MEDIA_BASE}/blog/${blog.slug || blog.id}`;
}

/** HTML をプレーンテキスト化して先頭 len 文字を返す（meta description 用） */
export function plainText(htmlStr: string, len = 160): string {
  return htmlStr
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, len);
}

export function buildBlogPosting(blog: Blog) {
  const body = blog.html || blog.content || "";
  const url = blogUrl(blog);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: plainText(body) || blog.title,
    ...(blog.eyecatch?.url ? { image: [blog.eyecatch.url] } : {}),
    datePublished: blog.publishedAt,
    dateModified: blog.revisedAt || blog.updatedAt || blog.publishedAt,
    author: { "@type": "Organization", name: "RIDE JOB編集部", url: MEDIA_BASE },
    publisher: PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(blog.category?.name ? { articleSection: blog.category.name } : {}),
  };
}

export function buildBreadcrumb(blog: Blog) {
  const items: { name: string; url: string }[] = [
    { name: "ホーム", url: `${MEDIA_BASE}/` },
  ];
  if (blog.category?.name && blog.category?.id) {
    items.push({
      name: blog.category.name,
      url: `${MEDIA_BASE}/blog?category=${blog.category.id}`,
    });
  }
  items.push({ name: blog.title, url: blogUrl(blog) });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/**
 * 記事本文から「よくある質問」セクションの Q&A を抽出する。
 * 本文中の `<h2>よくある質問</h2>` 以降に並ぶ
 * `<h3>Q. ...</h3><p>A. ...</p>` のペアを拾う（該当が無ければ空配列）。
 */
export function extractFaq(htmlStr: string): { q: string; a: string }[] {
  if (!htmlStr) return [];
  const idx = htmlStr.indexOf("よくある質問");
  if (idx === -1) return [];
  const section = htmlStr.slice(idx);
  const faqs: { q: string; a: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    const q = m[1].replace(/<[^>]*>/g, "").replace(/^Q[.．、:：]?\s*/, "").trim();
    const a = m[2].replace(/<[^>]*>/g, "").replace(/^A[.．、:：]?\s*/, "").trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

export function buildFaqPage(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
