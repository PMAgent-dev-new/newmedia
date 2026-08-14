/**
 * 記事本文中の YouTube リンクを、レスポンシブな埋め込みに昇格させる。
 *
 * なぜサイト側でやるか: microCMS のリッチエディタ（`content` フィールド）は保存時に
 * `<iframe>` / `<div>` / `class` をすべて剥がす（実測。`html` フィールドは保持する）。
 * CMSに iframe を書き込む方式は成立しないので、CMSにはリンクだけを置き、
 * 描画時に埋め込みへ変換する。
 *
 * 変換対象は「段落がYouTubeリンク1本だけ」の形に限る。本文中の文脈リンクを
 * 巨大なプレーヤーに化けさせないため。
 */

/** YouTube の動画IDは英数・ハイフン・アンダースコアの11文字。それ以外は受け付けない。 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const PARAGRAPH_WITH_SINGLE_LINK =
  /<p>\s*<a\s+href="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&]+)[^"]*"[^>]*>(.*?)<\/a>\s*<\/p>/g

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function upgradeYouTubeLinks(html: string): string {
  if (!html || !html.includes("youtube.com/watch")) return html
  return html.replace(PARAGRAPH_WITH_SINGLE_LINK, (whole, id: string, label: string) => {
    if (!VIDEO_ID.test(id)) return whole
    const plain = label.replace(/<[^>]+>/g, "").trim()
    const title = escapeAttr(plain || "YouTube動画")
    // Cookie同意（CMP）が未導入のため nocookie ドメインを使う。
    return (
      `<div class="yt-embed">` +
      `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${title}" ` +
      `loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" ` +
      `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>` +
      `</div>` +
      whole
    )
  })
}
