/**
 * 実行: npx tsx --test src/lib/structuredData.test.ts
 * （依存を増やさないため Node 標準の node:test を使う）
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { truncateForDescription, htmlToDescription, fitDescription, displayWidth } from './structuredData'

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
  // 第3引数は**表示幅**。幅40＝全角20字ぶん。句点までが幅38なので、そこで終われる
  const title = 'タクシー運転手の年収は本当に低いのか。' + 'あ'.repeat(200)
  assert.equal(htmlToDescription('', title, 40), 'タクシー運転手の年収は本当に低いのか。')
})

test('句点が候補の前半にしか無いときは字数で切る（ガードの回帰）', () => {
  // 句点が候補の35%より前にあると、そこで切ると極端に短くなるので採用しない。
  const title = 'です。' + 'あ'.repeat(200)
  const out = htmlToDescription('', title, 40)
  assert.ok(out.endsWith('…'), out)
  assert.ok(displayWidth(out) > 30, `短く切られすぎ: ${out}`)
})

test('★htmlToDescription の第3引数は文字数ではなく表示幅', () => {
  const html = '<p>' + 'タクシー運転手の平均年収は約400万円です。'.repeat(20) + '</p>'
  const out = htmlToDescription(html, 'タイトル', 140)
  assert.ok(displayWidth(out) <= 140, `幅超過: ${displayWidth(out)}`)
})

test('★ブランド名の途中で切らない（半角スペースを切断点にしない）', () => {
  const text = '全国のタクシードライバー求人・転職情報をお探しの方へ。未経験からの挑戦もキャリアアップも、RIDE JOBが専任アドバイザーとして無料でサポートします。'
  const out = fitDescription(text)
  assert.ok(!out.endsWith('RIDE…'), out)
  assert.ok(!/RIDE\s*…$/.test(out), out)
})

test('本文が無いときの fallback も幅に収まる', () => {
  const out = htmlToDescription('', 'あ'.repeat(300), 140)
  assert.ok(displayWidth(out) <= 140, `幅超過: ${displayWidth(out)}`)
})

test('構造化データ用の広い幅も指定できる', () => {
  const html = '<p>' + 'タクシー運転手の平均年収は約400万円です。'.repeat(30) + '</p>'
  const out = htmlToDescription(html, 'タイトル', 320)
  assert.ok(displayWidth(out) <= 320)
  assert.ok(displayWidth(out) > 140, `広い幅が効いていない: ${displayWidth(out)}`)
})

test('★半角のみの長文でも幅を1も超えない（「…」の幅は2）', () => {
  assert.ok(displayWidth(fitDescription('a'.repeat(300))) <= 140)
  assert.ok(displayWidth(fitDescription('※'.repeat(200))) <= 140)
})

test('全角記号を半角と数えない', () => {
  for (const [c, w] of [['※', 2], ['★', 2], ['…', 2], ['①', 2], ['Ａ', 2], ['🚕', 2], ['ｱ', 1]] as const)
    assert.equal(displayWidth(c as string), w, `${c} の幅`)
})

test('★予算を大きく余らせるくらいなら節の区切りまで伸ばす', () => {
  const lead =
    '全国のタクシードライバー求人・転職情報をお探しの方へ。未経験からの挑戦もキャリアアップも、RIDE JOBが専任アドバイザーとして無料でサポートします。二種免許の取得支援や給与保証のある求人も多数掲載しています。'
  const out = fitDescription(lead)
  assert.ok(displayWidth(out) >= 80, `予算を使えていない: 幅${displayWidth(out)} ${out}`)
  assert.ok(displayWidth(out) <= 140)
})

test('次の文が予算に収まるなら文で終わる（節へ伸ばさない）', () => {
  const lead = '大阪府でドライバー・整備士として働きたい方へ。物流・運送から自動車整備まで、幅広い求人が見つかります。' + 'あ'.repeat(100)
  assert.ok(fitDescription(lead).endsWith('。'))
})
