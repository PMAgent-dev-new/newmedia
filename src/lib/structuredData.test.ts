/**
 * 実行: npx tsx --test src/lib/structuredData.test.ts
 * （依存を増やさないため Node 標準の node:test を使う）
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { truncateForDescription, htmlToDescription } from './structuredData'

test('上限以下ならそのまま返す', () => {
  assert.equal(truncateForDescription('短い文です。', 140), '短い文です。')
})

test('★句点で切れるなら句点で終わる（「…」は付けない）', () => {
  const text = 'タクシー運転手の年収は地域で大きく変わります。' + 'あ'.repeat(200)
  const out = truncateForDescription(text, 40)
  assert.ok(out.endsWith('。'), `句点で終わっていない: ${out}`)
  assert.ok(!out.includes('…'))
})

test('★句点が無ければ読点で切る', () => {
  const text = 'タクシー運転手として働くうえで、' + 'あ'.repeat(200)
  const out = truncateForDescription(text, 40)
  assert.ok(out.endsWith('…'))
  assert.ok(!out.endsWith('、…'), `読点が残っている: ${out}`)
  assert.ok(out.startsWith('タクシー運転手として働くうえで'))
})

test('切断位置が前半すぎるときは採用しない（極端に短い description を防ぐ）', () => {
  // 句点は3字目。ここで切ると 140字の予算に対し3字しか残らない
  const text = 'です。' + 'あ'.repeat(200)
  const out = truncateForDescription(text, 40)
  assert.ok(out.length > 30, `短く切られすぎ: ${out}`)
})

test('サロゲートペアを壊さない', () => {
  const text = '🚕'.repeat(100)
  const out = truncateForDescription(text, 10)
  assert.ok(!out.includes('�'))
  assert.equal(Array.from(out).length, 10)
})

test('上限が2未満なら空文字（「…」だけの description を作らない）', () => {
  assert.equal(truncateForDescription('あいうえお', 1), '')
  assert.equal(truncateForDescription('', 140), '')
})

test('htmlToDescription も文の区切りで終わる', () => {
  const html = '<h2>タクシー運転手の年収</h2><p>' + 'タクシー運転手の平均年収は約400万円です。'.repeat(20) + '</p>'
  const out = htmlToDescription(html, 'タイトル', 140)
  assert.ok(out.endsWith('。'), out.slice(-20))
})

test('本文が無いときは title を文境界で切る（回帰）', () => {
  // 句点は19字目。上限30字なら候補29字の後半（15字目以降）に入るので採用される
  const title = 'タクシー運転手の年収は本当に低いのか。' + 'あ'.repeat(200)
  assert.equal(htmlToDescription('', title, 30), 'タクシー運転手の年収は本当に低いのか。')
})

test('句点が候補の前半にしか無いときは字数で切る（ガードの回帰）', () => {
  // 同じ title を上限40字で見ると、句点(19字目)は候補39字の後半（20字目以降）に入らない。
  // ここで句点を採用すると 19字しか残らず、40字の予算に対して短すぎる。
  // 極端に短い description を作らないための意図的な挙動。
  const title = 'タクシー運転手の年収は本当に低いのか。' + 'あ'.repeat(200)
  const out = htmlToDescription('', title, 40)
  assert.ok(out.endsWith('…'), out)
  assert.equal(Array.from(out).length, 40)
})
