import { dedupeBySlug, fetchAllBlogsCached } from "@/lib/allBlogs";
import { playableVideoIds } from "@/lib/youtubeEmbed";
import type { Blog } from "@/types/microcms";

/**
 * 記事本文から YouTube 動画を拾い、「動画で見る」一覧の材料にする。
 *
 * なぜ本文から拾うか: microCMS 側に「動画つき」を表すフィールドが無く、
 * カテゴリを新設すると記事が本来のカテゴリ（お役立ち情報など）から離れてしまう。
 * 求職者は「動画発の記事」ではなく主題で探すので、記事の所属は変えずに
 * 横断の入口だけを作るのが正しい。本文を見れば動画の有無は自明なので、
 * 運用の手入れが要らない（記事に動画を足せば自動でこの一覧に載る）。
 *
 * ⚠️ 判定は必ず youtubeEmbed の playableVideoIds を使う。ここに独自の正規表現を
 * 書くと記事側の昇格条件とズレて、「動画あり」と書いたカードの遷移先に
 * プレーヤーが無い、という事故になる（実測で14件中4件がその状態だった）。
 */
export interface VideoArticle {
  slug: string;
  title: string;
  videoId: string;
  publishedAt: string;
  eyecatch?: string;
  /** 動画に添えた案内文（「動画で見る：〜」の見出し）。無ければ記事タイトルで代用 */
  heading?: string;
}

const VIDEO_HEADING = /<h2[^>]*>\s*(動画で見る[^<]*)<\/h2>/;

const body = (b: Blog) => (b.html || b.content || "") as string;

export async function getVideoArticles(): Promise<VideoArticle[]> {
  const all = dedupeBySlug(await fetchAllBlogsCached());

  const out: VideoArticle[] = [];
  for (const b of all) {
    const html = body(b);
    if (!html) continue;
    const ids = playableVideoIds(html);
    if (ids.length === 0) continue;
    const h = VIDEO_HEADING.exec(html);
    out.push({
      slug: (b.slug || b.id) as string,
      title: b.title,
      videoId: ids[0],
      publishedAt: b.publishedAt,
      eyecatch: b.eyecatch?.url,
      heading: h ? h[1].replace(/^動画で見る[：:]\s*/, "") : undefined,
    });
  }
  // 新しい順。同着は slug で安定させる（順序がぶれると差分が読めなくなる）
  return out.sort((a, z) =>
    z.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(z.slug),
  );
}
