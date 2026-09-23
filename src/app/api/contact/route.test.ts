import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 問い合わせは Lark 通知が唯一の記録なので、通知が落ちた時点で内容が消える。
 * 2026-09-21 には LARK_WEBHOOK_URL が未設定のまま公開され、フォームは表示されるのに
 * 送信だけが落ちている状態が誰にも気づかれなかった。退避先はその最後の受け皿。
 */
describe("/media/api/contact", () => {
  const body = {
    name: "山田 太郎",
    company: "株式会社テスト",
    email: "taro@example.com",
    message: "求人掲載について相談したいです。よろしくお願いします。",
  };

  const makeRequest = () =>
    new Request("https://ridejob.jp/media/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    vi.stubEnv("LARK_WEBHOOK_URL", "https://open.larksuite.com/open-apis/bot/v2/hook/aaaa");
    vi.stubEnv("SUBMISSION_VAULT_URL", "https://tdlnowmdanapxmgebaqu.supabase.co");
    vi.stubEnv("SUBMISSION_VAULT_SERVICE_KEY", "test-vault-key");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("Lark 通知が落ちたら問い合わせを退避先へ残す", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.fn(async (input: unknown, _init: RequestInit | undefined) => {
      if (String(input).includes("/rest/v1/submission_vault")) {
        return new Response(null, { status: 201 });
      }
      return Response.json({ code: 19001, msg: "param invalid" });
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { POST } = await import("./route");
    const res = await POST(makeRequest());
    expect(res.status).toBe(502);

    const vaultPosts = fetchSpy.mock.calls.filter(([target]) =>
      String(target).includes("/rest/v1/submission_vault"),
    );
    expect(vaultPosts.length, "問い合わせをどこにも残さない経路を作らないこと").toBe(1);
    const saved = JSON.parse(String(vaultPosts[0][1]?.body ?? "{}"));
    expect(saved.kind).toBe("contact");
    expect(saved.payload?.email, "連絡先が無いと退避しても意味がない").toBe(body.email);
    errorSpy.mockRestore();
  });

  it("退避先が落ちても応答は変わらない（退避のせいで挙動を変えない）", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.fn(async (input: unknown, _init: RequestInit | undefined) => {
      if (String(input).includes("/rest/v1/submission_vault")) throw new Error("boom");
      return Response.json({ code: 19001, msg: "param invalid" });
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(502);
    // 退避を呼んでいることまで見ないと、配線が外れても pass する
    expect(
      fetchSpy.mock.calls.filter(([t]) => String(t).includes("submission_vault")).length,
    ).toBe(1);
    errorSpy.mockRestore();
  });

  // レビュー②の指摘: PR もテストも 2026-09-21 の「未設定のまま公開」を根拠にしているのに、
  // まさにその分岐では退避が呼ばれていなかった。
  it("Webhook が未設定でも問い合わせを退避先へ残す", async () => {
    vi.stubEnv("LARK_WEBHOOK_URL", "");
    const fetchSpy = vi.fn(async (_input: unknown, _init: RequestInit | undefined) =>
      new Response(null, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(500);
    const posts = fetchSpy.mock.calls.filter(([t]) => String(t).includes("submission_vault"));
    expect(posts.length, "設定漏れで問い合わせを捨てないこと").toBe(1);
    expect(JSON.parse(String(posts[0][1]?.body ?? "{}")).reason).toContain("not configured");
  });

  // レビュー②の指摘: 生 fetch なので到達性障害は例外になり、catch で 400 に落ちていた。
  it("Lark へ到達できない（例外）ときも退避へ残す", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.fn(async (input: unknown, _init: RequestInit | undefined) => {
      if (String(input).includes("/rest/v1/submission_vault")) {
        return new Response(null, { status: 201 });
      }
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("./route");
    const res = await POST(makeRequest());
    expect(res.status, "400『不正なリクエスト』に落とさないこと").toBe(502);
    const posts = fetchSpy.mock.calls.filter(([t]) => String(t).includes("submission_vault"));
    expect(posts.length).toBe(1);
    expect(JSON.parse(String(posts[0][1]?.body ?? "{}")).reason).toContain("unreachable");
    errorSpy.mockRestore();
  });

  it("通知が成功したら退避には書かない（正常時は1行も増やさない）", async () => {
    const fetchSpy = vi.fn(async (_input: unknown, _init: RequestInit | undefined) =>
      Response.json({ code: 0, msg: "ok" }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(200);
    expect(
      fetchSpy.mock.calls.filter(([t]) => String(t).includes("submission_vault")).length,
    ).toBe(0);
  });

  it("設定チェック(GET)は退避先の未設定も落とす", async () => {
    vi.stubEnv("SUBMISSION_VAULT_SERVICE_KEY", "");
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).vaultConfigured).toBe(false);
  });
});
