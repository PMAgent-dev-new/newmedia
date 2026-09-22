import { test } from "node:test";
import assert from "node:assert/strict";
import { optimizeBodyImages, paramsFor } from "./mediaImages";

const IMG = "https://images.microcms-assets.io/assets/x/y/a.png";

test("microCMS の画像にパラメータを付ける", () => {
  assert.equal(
    optimizeBodyImages(`<p><img src="${IMG}" alt="図"></p>`),
    `<p><img src="${IMG}?${paramsFor(IMG)}" alt="図"></p>`
  );
});

test("すでにパラメータがある画像は触らない", () => {
  const src = `<img src="${IMG}?w=400">`;
  assert.equal(optimizeBodyImages(src), src);
});

test("microCMS 以外のホストは対象外", () => {
  const src = `<img src="https://i.ytimg.com/vi/abc/hqdefault.jpg">`;
  assert.equal(optimizeBodyImages(src), src);
});

test("data-src には付けない（src より前にあっても）", () => {
  const out = optimizeBodyImages(`<img data-src="${IMG}" src="${IMG}">`);
  assert.equal(out, `<img data-src="${IMG}" src="${IMG}?${paramsFor(IMG)}">`);
  assert.equal(out.split("fm=webp").length - 1, 1);
});

test("gif と svg は変換しない", () => {
  for (const ext of ["gif", "svg"]) {
    const url = IMG.replace(".png", `.${ext}`);
    assert.equal(optimizeBodyImages(`<img src="${url}">`), `<img src="${url}">`);
  }
});

test("すでに webp のものは fm を付けない", () => {
  const url = IMG.replace(".png", ".webp");
  const out = optimizeBodyImages(`<img src="${url}">`);
  assert.ok(!out.includes("fm=webp"));
  assert.ok(out.includes("q=80&w=1600"));
});

test("1つの本文に複数枚あっても全部に付く", () => {
  const out = optimizeBodyImages(`<img src="${IMG}"><img src="${IMG}">`);
  assert.equal(out.split("fm=webp").length - 1, 2);
});

test("属性の順序が src より前でも動く", () => {
  assert.equal(
    optimizeBodyImages(`<img class="w-full" loading="lazy" src="${IMG}" />`),
    `<img class="w-full" loading="lazy" src="${IMG}?${paramsFor(IMG)}" />`
  );
});

test("空文字でも落ちない", () => {
  assert.equal(optimizeBodyImages(""), "");
});
