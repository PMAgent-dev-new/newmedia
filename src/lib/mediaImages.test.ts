import { test } from "node:test";
import assert from "node:assert/strict";
import { optimizeBodyImages, IMAGE_PARAMS } from "./mediaImages";

const IMG = "https://images.microcms-assets.io/assets/x/y/a.png";

test("microCMS の画像にパラメータを付ける", () => {
  assert.equal(
    optimizeBodyImages(`<p><img src="${IMG}" alt="図"></p>`),
    `<p><img src="${IMG}?${IMAGE_PARAMS}" alt="図"></p>`
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

test("1つの本文に複数枚あっても全部に付く", () => {
  const out = optimizeBodyImages(`<img src="${IMG}"><img src="${IMG}">`);
  assert.equal(out.split(IMAGE_PARAMS).length - 1, 2);
});

test("属性の順序が src より前でも動く", () => {
  assert.equal(
    optimizeBodyImages(`<img class="w-full" loading="lazy" src="${IMG}" />`),
    `<img class="w-full" loading="lazy" src="${IMG}?${IMAGE_PARAMS}" />`
  );
});

test("空文字・未定義相当でも落ちない", () => {
  assert.equal(optimizeBodyImages(""), "");
});
