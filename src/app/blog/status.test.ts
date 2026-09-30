import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * 記事ページが 404（記事なし）と 500（取得失敗）を状態コードで返せるのは、描画の手前に
 * Suspense の境界が無いから。blog/[slug]/loading.tsx を置くと、Next は先に 200 で送り始めるので、
 * 404 も 500 も 200（中身だけエラー）になる（2026-09-30 に next start で実測）。
 * app 直下・blog 配下のほかの loading.tsx や、layout・template で使う Suspense でも同じことが起きうる。
 * layout が {children} を部品で包むようになったら、その部品の中も確かめること（ここでは見ていない）。
 * このテストはビルド（next build）では走らない。これらのファイルを触ったら `npm run test:unit` を流し、
 * 置く必要が出たら、このテストを外す前に状態コードを実測すること。
 */
describe("/media/blog の状態コードの前提", () => {
  const appDir = fileURLToPath(new URL("..", import.meta.url));
  const blogDir = fileURLToPath(new URL(".", import.meta.url));

  // app 直下と blog 配下にある loading・layout・template のファイル
  const filesOnPath = (name: string) => {
    const matches = (file: string) => new RegExp(`(^|/)${name}\\.[jt]sx?$`).test(file);
    return [
      ...readdirSync(appDir).filter(matches).map((file) => join(appDir, file)),
      ...readdirSync(blogDir, { recursive: true, encoding: "utf8" })
        .filter(matches)
        .map((file) => join(blogDir, file)),
    ];
  };

  it("loading ファイルが無い", () => {
    expect(filesOnPath("loading")).toEqual([]);
  });

  it("layout・template で Suspense を使っていない", () => {
    const layouts = filesOnPath("layout");
    expect(layouts.length).toBeGreaterThan(0); // app/layout.tsx
    const files = [...layouts, ...filesOnPath("template")];
    expect(files.filter((file) => readFileSync(file, "utf8").includes("Suspense"))).toEqual([]);
  });
});
