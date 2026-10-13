import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SubmissionRecord } from "@/lib/submissionLedger";

// 受付台帳（Supabase submissions）: 問い合わせを、成否に関わらず1件1行で残す（入力の不備と bot は残さない）
const recordSpy = vi.fn<(record: SubmissionRecord) => void>();
vi.mock("@/lib/submissionLedger", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/submissionLedger")>()),
  recordSubmissionAfterResponse: (record: SubmissionRecord) => recordSpy(record),
}));

describe("/media/api/contact の受付台帳", () => {
  const body = {
    name: "山田 太郎",
    company: "株式会社テスト",
    email: "Taro@Example.com",
    message: "求人掲載について相談したいです。よろしくお願いします。",
  };

  const makeRequest = (overrides: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
    new Request("https://ridejob.jp/media/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "test-agent", ...headers },
      body: JSON.stringify({ ...body, ...overrides }),
    });

  const larkOk = () =>
    vi.fn(async (input: unknown) => {
      if (String(input).includes("/rest/v1/submission_vault")) return new Response(null, { status: 201 });
      return Response.json({ code: 0, msg: "ok" });
    });

  beforeEach(() => {
    vi.stubEnv("LARK_WEBHOOK_URL", "https://open.larksuite.com/open-apis/bot/v2/hook/aaaa");
    vi.stubEnv("SUBMISSION_VAULT_URL", "https://example.supabase.co");
    vi.stubEnv("SUBMISSION_VAULT_SERVICE_KEY", "test-vault-key");
    vi.resetModules();
    recordSpy.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("正常に通知できた問い合わせを1行残す", async () => {
    vi.stubGlobal("fetch", larkOk());
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(200);

    expect(recordSpy).toHaveBeenCalledTimes(1);
    const record = recordSpy.mock.calls[0][0];
    expect(record.source).toBe("newmedia/contact");
    expect(record.kind).toBe("contact");
    expect(record.submissionId).toMatch(/^contact:[0-9a-f]{32}$/);
    expect(record.applicant).toMatchObject({ name: body.name, company: body.company, email: body.email, message: body.message });
    expect(record.context).toEqual({ request: { user_agent: "test-agent", referer: "" } });
    expect(record.notification).toMatchObject({ sent: true, via: "webhook" });
    expect(record.notification?.text).toContain("新しいお問い合わせ");
    expect(record.outcome).toMatchObject({ notified: true, webhook_status: 200, http_status: 200 });
  });

  it("同じ日に同じ中身を送り直すと同じ受付IDになる（メールの大文字小文字は区別しない）", async () => {
    vi.stubGlobal("fetch", larkOk());
    const { POST } = await import("./route");
    await POST(makeRequest());
    await POST(makeRequest({ email: "taro@example.com" }));
    expect(recordSpy).toHaveBeenCalledTimes(2);
    expect(recordSpy.mock.calls[0][0].submissionId).toBe(recordSpy.mock.calls[1][0].submissionId);
  });

  it("入力の不備（400）と bot（honeypot）は残さない", async () => {
    vi.stubGlobal("fetch", larkOk());
    const { POST } = await import("./route");
    expect((await POST(makeRequest({ message: "短い" }))).status).toBe(400);
    expect((await POST(makeRequest({ honeypot: "x" }))).status).toBe(200);
    expect(recordSpy).not.toHaveBeenCalled();
  });

  it("通知が落ちて退避した問い合わせも残す（通知できなかったことと退避の理由つき）", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: unknown) => {
        if (String(input).includes("/rest/v1/submission_vault")) return new Response(null, { status: 201 });
        return Response.json({ code: 19001, msg: "param invalid" });
      }),
    );
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(200);
    const record = recordSpy.mock.calls[0][0];
    expect(record.notification).toMatchObject({ sent: false, via: "webhook" });
    expect(record.outcome).toMatchObject({ notified: false, http_status: 200, vault: { saved: true } });
    expect(String((record.outcome?.vault as { reason?: string }).reason)).toContain("code=19001");
    errorSpy.mockRestore();
  });

  it("Lark へ届かず退避にも残せなかった問い合わせも、返した 502 と一緒に残す", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(502);
    expect(recordSpy.mock.calls[0][0].outcome).toMatchObject({
      notified: false,
      webhook_status: 0,
      http_status: 502,
      vault: { saved: false },
    });
    errorSpy.mockRestore();
  });

  it("Webhook が未設定のときも残す", async () => {
    vi.stubEnv("LARK_WEBHOOK_URL", "");
    vi.stubGlobal("fetch", larkOk());
    const { POST } = await import("./route");
    expect((await POST(makeRequest())).status).toBe(200);
    expect(recordSpy.mock.calls[0][0].outcome).toMatchObject({
      notified: false,
      http_status: 200,
      vault: { saved: true, reason: "LARK_WEBHOOK_URL not configured" },
    });
  });

  it("IP アドレスは残さない", async () => {
    vi.stubGlobal("fetch", larkOk());
    const { POST } = await import("./route");
    await POST(makeRequest({}, { "x-forwarded-for": "203.0.113.7", "x-real-ip": "203.0.113.7" }));
    expect(JSON.stringify(recordSpy.mock.calls[0][0])).not.toContain("203.0.113.7");
  });
});
