/**
 * 記事本文中の microCMS 画像に、画像APIの変換パラメータを描画時に付ける。
 *
 * なぜ要るか: 本文は `dangerouslySetInnerHTML` でそのまま描画するため、アイキャッチと違い
 * next/image を通らない（`next.config.ts` の minimumCacheTTL も効かない）。読者のブラウザが
 * microCMS から**原寸のPNGを直接**取りにいく。
 *
 * microCMS の「データ転送量」は API の JSON だけでなく**メディアの取得も加算対象**で、
 * Hobbyプランは 20GB/月 を超えるとAPIが停止する（公式ドキュメント「データ転送量」。
 * 2026-09-23 に 10GB 到達の通知が届いたのが発端）。
 *
 * 実測（2026-09-23）:
 *   本文画像4枚の記事（tokyo-robotaxi-2026）: 325KB → 約70KB
 *   1200x675 PNG 128,668B → webp 36,496B ／ 2400x855 PNG 67KB → w=1600 で 21,408B
 */

/**
 * 変換の横幅上限。本文の表示幅（約800px）× Retina の2倍。
 *
 * ⚠️ 1200 にすると、本文の図解で最も多い width=2400 の画像（実測704枚）が
 * Retina で文字が甘くなる。`w` は上限なので、これより小さい画像は拡大されない
 * （1200px の画像に w=1600 を付けても付けなくてもバイト数が同一だと実測）。
 */
const MAX_WIDTH = 1600;

/** 品質。目視で劣化が分からない範囲で、既定より軽くする。 */
const QUALITY = 80;

/**
 * 変換しない拡張子。
 * - gif: webp 化するとアニメーションが1コマになる
 * - svg: ラスタライズされて拡大時に粗くなる（そもそも軽い）
 * 実データには現状どちらも0枚だが、混ざった瞬間に黙って壊れる側なので先に除く。
 */
const SKIP = /\.(gif|svg)$/i;

/** すでに webp のものは `fm` を付けない（二重圧縮を避ける）。 */
const isWebp = (url: string) => /\.webp$/i.test(url);

export const paramsFor = (url: string): string =>
  isWebp(url) ? `q=${QUALITY}&w=${MAX_WIDTH}` : `fm=webp&q=${QUALITY}&w=${MAX_WIDTH}`;

/**
 * `<img ... src="https://images.microcms-assets.io/...">` にパラメータを付ける。
 *
 * - すでに `?` が付いているものは触らない（編集者が個別に指定した意図を壊さない）
 * - ⚠️ `\bsrc="` だと **`data-src="` にもマッチする**（`-` と `s` の間に単語境界が立つため）。
 *   表示に使われない属性に付けると、`src` は原寸のまま＝削減が黙って外れる。
 *   `(?<![-\w])` で直前がハイフンや英数字でないことを要求する。
 * - microCMS 以外のホスト（YouTube サムネイル等）は対象外
 * - `srcset` は microCMS のリッチエディタが出力しない（実データ1,926枚で0件）
 */
export function optimizeBodyImages(html: string): string {
  if (!html) return html;
  return html.replace(
    /(<img\b[^>]*?(?<![-\w])src=")(https:\/\/images\.microcms-assets\.io\/[^"?]+)(")/g,
    (match, head: string, url: string, tail: string) =>
      SKIP.test(url) ? match : `${head}${url}?${paramsFor(url)}${tail}`
  );
}
