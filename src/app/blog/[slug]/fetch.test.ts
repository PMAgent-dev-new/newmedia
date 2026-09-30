import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 記事ページが使う取得関数のテスト（ページの 404／500 の分かれ目そのものは扱わない）。
 * 記事ページは「記事が無い」ときと形の合わない URL は 404、取得に失敗したときは 500 にする。
 * 失敗まで「記事なし（null）」として返すと、microCMS の障害や制限のあいだ実在の記事が
 * 404＋noindex になり、検索結果から外れていく。
 */
describe("記事の取得（getBlogBySlug / getBlogById）", () => {
  const fetchMock = vi.fn();

  // microcms.ts は環境変数を読み込み時に確定させるので、テストごとに読み直す
  const load = async () => {
    vi.resetModules();
    return import("@/lib/microcms");
  };

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });

  beforeEach(() => {
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("渡せないキーは問い合わせずに null（404）", () => {
    // 角括弧はフィルタの演算子になり（`zzz[or]slug[exists]` は別の記事に一致）、
    // `../` を含むと microCMS は JSON でない応答を返す。取得失敗＝500 にしないよう手前で落とす
    const invalid = ["", "../x", "a/b", "a?b", "a#b", "a%2Fb", "a[or]b", "zzz[or]slug[exists]", "a b", "a+b", "あいう"];

    it.each(invalid)("slug %j", async (key) => {
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug(key)).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    // ID はパスに入る。microCMS の ID は英数字・`-`・`_` だけで、`.` があると 400 が返る
    it.each([...invalid, "..", "a.b", "wp-login.php", "a~b"])("id %j", async (key) => {
      const { getBlogById } = await load();
      await expect(getBlogById(key)).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it("slug として通す形は、フィルタの値としてそのまま問い合わせる", async () => {
    fetchMock.mockImplementation(async () => json(200, { contents: [], totalCount: 0 }));
    const { getBlogBySlug } = await load();
    for (const slug of ["wp-login.php", "a.b", "..", "a~b", "Upper-Case_1"]) {
      fetchMock.mockClear();
      await expect(getBlogBySlug(slug)).resolves.toBeNull();
      const url = new URL(String(fetchMock.mock.calls[0][0]));
      expect(url.searchParams.get("filters")).toBe(`slug[equals]${slug}`);
      expect(url.searchParams.get("limit")).toBe("1");
    }
  });

  it("現存の記事の形（slug・ID）は通す", async () => {
    const { isBlogSlug, isBlogId } = await load();
    for (const slug of ["taxi-training-program", "company_interview_6", "voice_4", "mechanic-career-outlook"]) {
      expect(isBlogSlug(slug)).toBe(true);
    }
    for (const id of ["qwavm3d2ek", "jkfur2_4m", "rcya_fzxaeju", "km-r2191rr5l", "5lvz5skrw"]) {
      expect(isBlogId(id)).toBe(true);
      // slug の無い記事は ID が URL になり、まず slug として問い合わせられる
      expect(isBlogSlug(id)).toBe(true);
    }
  });

  describe("getBlogBySlug", () => {
    it("0件なら null", async () => {
      fetchMock.mockResolvedValue(json(200, { contents: [], totalCount: 0, offset: 0, limit: 1 }));
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("no-such-article")).resolves.toBeNull();
    });

    it("見つかれば先頭の記事を返し、slug はフィルタに入る", async () => {
      fetchMock.mockResolvedValue(json(200, { contents: [{ id: "abc", slug: "taxi-training-program" }], totalCount: 1 }));
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).resolves.toMatchObject({ id: "abc" });
      const url = String(fetchMock.mock.calls[0][0]);
      expect(decodeURIComponent(url)).toContain("filters=slug[equals]taxi-training-program");
    });

    it.each([400, 401, 403, 429, 500, 503])("%i なら throw（404 にしない）", async (status) => {
      fetchMock.mockResolvedValue(json(status, { message: "error" }));
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).rejects.toThrow(String(status));
    });

    it("通信に失敗したら throw", async () => {
      fetchMock.mockRejectedValue(new TypeError("fetch failed"));
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).rejects.toThrow("fetch failed");
    });

    it("JSON でない応答は throw", async () => {
      fetchMock.mockResolvedValue(
        new Response("<!DOCTYPE html><html></html>", { status: 200, headers: { "content-type": "text/html" } }),
      );
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).rejects.toThrow(SyntaxError);
    });

    it("contents の無い応答は throw", async () => {
      fetchMock.mockResolvedValue(json(200, { message: "unexpected" }));
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).rejects.toThrow();
    });

    it("環境変数が無ければ throw", async () => {
      vi.stubEnv("MICROCMS_API_KEY", "");
      vi.stubEnv("NEXT_PUBLIC_MICROCMS_API_KEY", "");
      const { getBlogBySlug } = await load();
      await expect(getBlogBySlug("taxi-training-program")).rejects.toThrow("not properly configured");
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("getBlogById", () => {
    it("404 なら null", async () => {
      fetchMock.mockResolvedValue(json(404, { message: "Content is not found." }));
      const { getBlogById } = await load();
      await expect(getBlogById("zzzz")).resolves.toBeNull();
    });

    it("見つかれば記事を返し、ID はパスに入る", async () => {
      fetchMock.mockResolvedValue(json(200, { id: "qwavm3d2ek", title: "記事" }));
      const { getBlogById } = await load();
      await expect(getBlogById("qwavm3d2ek")).resolves.toMatchObject({ id: "qwavm3d2ek" });
      expect(String(fetchMock.mock.calls[0][0])).toBe("https://example.microcms.io/api/v1/blogs/qwavm3d2ek");
    });

    it.each([400, 401, 403, 429, 500, 503])("%i なら throw（404 にしない）", async (status) => {
      fetchMock.mockResolvedValue(json(status, { message: "error" }));
      const { getBlogById } = await load();
      await expect(getBlogById("qwavm3d2ek")).rejects.toThrow(String(status));
    });

    it("通信に失敗したら throw", async () => {
      fetchMock.mockRejectedValue(new TypeError("fetch failed"));
      const { getBlogById } = await load();
      await expect(getBlogById("qwavm3d2ek")).rejects.toThrow("fetch failed");
    });

    it("id の無い応答は throw", async () => {
      fetchMock.mockResolvedValue(json(200, { message: "unexpected" }));
      const { getBlogById } = await load();
      await expect(getBlogById("qwavm3d2ek")).rejects.toThrow("id is not a string");
    });

    it("環境変数が無ければ throw", async () => {
      vi.stubEnv("MICROCMS_API_KEY", "");
      vi.stubEnv("NEXT_PUBLIC_MICROCMS_API_KEY", "");
      const { getBlogById } = await load();
      await expect(getBlogById("qwavm3d2ek")).rejects.toThrow("not properly configured");
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
