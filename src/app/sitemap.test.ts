import { describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";
import { MERGED_SLUGS } from "@/lib/blogList";
import sitemap, { dynamic } from "./sitemap";

// microCMS へは行かず、統合して転送した記事と、その転送先の2本を返す
vi.mock("@/lib/allBlogs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/allBlogs")>();
  return {
    ...actual,
    fetchAllBlogsCached: vi.fn(async () => [
      { id: "old", slug: "robotaxi-taxi-driver-future", title: "統合した記事", publishedAt: "2026-08-03T01:00:05.674Z", updatedAt: "2026-10-23T07:09:21.431Z" },
      { id: "pillar", slug: "taxi-autonomous-driving", title: "転送先の記事", publishedAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-10-23T07:07:04.931Z" },
    ]),
  };
});

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

  it("統合して転送している記事は載せない（転送先は載せる）", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/blog/taxi-autonomous-driving"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/blog/robotaxi-taxi-driver-future"))).toBe(false);
  });

  // 一覧から外したのに転送が無いと、その記事はどこからも辿れなくなる
  it("一覧から外す記事は、どれも next.config.ts で 301 転送している", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    for (const slug of MERGED_SLUGS) {
      const redirect = redirects.find((r) => r.source === `/blog/${slug}`);
      expect(redirect, slug).toMatchObject({ statusCode: 301 });
    }
  });
});
