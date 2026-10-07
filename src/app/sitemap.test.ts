import { describe, expect, it } from "vitest";
import { dynamic } from "./sitemap";

/**
 * サイトマップの作り方の回帰テスト。
 * force-dynamic を外すと、`next build` の表示は「1h」のままでも、Vercel が使う adapter には
 * ビルド時の内容が静的ファイルとして渡り、デプロイするまで新しい記事が載らない（理由は sitemap.ts のコメント）。
 * 表示が正しく見えるので、ビルドの結果では気づけない。
 */
describe("サイトマップ", () => {
  it("リクエストのたびに作る（force-dynamic）", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
