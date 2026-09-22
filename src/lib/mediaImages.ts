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
 * 実測（2026-09-23・tokyo-robotaxi-2026 の本文画像4枚）:
 *   無変換 325KB → `?fm=webp&q=80&w=1200` で 約70KB（約78%減）
 *   単体例: 1200x675 の PNG 128,668B → webp 36,496B
 *
 * w=1200 は上限であって拡大はしない（1200px 未満の画像は指定の有無でバイト数が同一だと実測）。
 * 記事本文の表示幅はこれより狭いので、Retina でも足りる。
 */

/** 変換パラメータ。品質は 80（microCMS の既定より軽く、目視で劣化が分からない範囲）。 */
export const IMAGE_PARAMS = "fm=webp&q=80&w=1200";

/**
 * `src="https://images.microcms-assets.io/..."` にパラメータを付ける。
 *
 * - すでに `?` が付いているものは触らない（編集者が個別に指定した意図を壊さないため）
 * - microCMS 以外のホスト（YouTube サムネイル等）は対象外
 * - `srcset` は microCMS のリッチエディタが出力しないので扱わない
 */
export function optimizeBodyImages(html: string): string {
  if (!html) return html;
  return html.replace(
    /(<img\b[^>]*?\bsrc=")(https:\/\/images\.microcms-assets\.io\/[^"?]+)(")/g,
    (_m, head: string, url: string, tail: string) => `${head}${url}?${IMAGE_PARAMS}${tail}`
  );
}
