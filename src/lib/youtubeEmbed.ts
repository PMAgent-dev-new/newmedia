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

// `(.*?)` だと最初の </a> で止まらず段落末尾まで伸びるため、本文中の文脈リンクを含む
// 段落まで変換してしまう（title属性に段落全文が混入する）。</a> を含まない形で限定する。
//
// 末尾の `<br>` と `&nbsp;` を許すのは、microCMS のリッチエディタで Shift+Enter を
// 押すと簡単に入るため（実測: インタビュー記事3本がこの形で昇格できていなかった）。
// youtu.be の短縮URLも受ける（同じく実測で既存記事が使っている）。
const PARAGRAPH_WITH_SINGLE_LINK =
  /<p(?:\s[^>]*)?>\s*<a\s+href="https?:\/\/(?:(?:www\.)?youtube\.com\/watch\?v=|youtu\.be\/)([^"&?]+)[^"]*"[^>]*>((?:(?!<\/a>)[\s\S])*?)<\/a>(?:\s|<br\s*\/?>|&nbsp;)*<\/p>/g

/** 本文に既に置かれている埋め込み（`html` フィールドの記事はiframeが剥がされず残る）。 */
const EXISTING_EMBED = /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/g

/**
 * この本文でプレーヤーとして再生できる動画IDを、出現順に返す。
 *
 * 「動画で見る」一覧（/media/videos）の判定はここを使う。一覧と昇格が別々の
 * 正規表現を持つと必ずズレて、「動画あり」と書いたカードの遷移先に
 * プレーヤーが無い、という事故になる（実測で14件中4件がその状態だった）。
 */
export function playableVideoIds(html: string): string[] {
  if (!html) return []
  const ids: string[] = []
  const push = (id: string) => {
    if (VIDEO_ID.test(id) && !ids.includes(id)) ids.push(id)
  }
  for (const m of html.matchAll(EXISTING_EMBED)) push(m[1])
  for (const m of html.matchAll(PARAGRAPH_WITH_SINGLE_LINK)) push(m[1])
  return ids
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function upgradeYouTubeLinks(html: string): string {
  if (!html || !html.includes("youtube.com/watch")) return html
  // 同じ動画IDが「リンク1本だけの段落」として2回書かれた記事では、両方が昇格して
  // 同じプレーヤーが並ぶ。既に出した分をここで覚えておく（下の includes は変換前の
  // 入力しか見ないので、この回で発行したものは検出できない）。
  const emitted = new Set<string>()
  return html.replace(PARAGRAPH_WITH_SINGLE_LINK, (whole, id: string, label: string) => {
    if (!VIDEO_ID.test(id)) return whole
    // `html` フィールドの記事は iframe が剥がされずCMSに残っている（taxi-driver-salary）。
    // そこへ昇格を重ねると同じ動画のプレーヤーが2つ並ぶので、既にあるなら何もしない。
    if (html.includes(`/embed/${id}`) || emitted.has(id)) return whole
    emitted.add(id)
    const plain = label.replace(/<[^>]+>/g, "").trim()
    // リンクテキストがURLそのものの記事がある。title はスクリーンリーダーが読み上げる
    // 唯一のラベルなので、URLを読み上げさせず既定のラベルに落とす。
    const title = escapeAttr(plain && !/^https?:\/\//i.test(plain) ? plain : "YouTube動画")
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
