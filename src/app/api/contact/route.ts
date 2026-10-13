import { NextResponse } from "next/server";
import { saveToSubmissionVault } from "@/lib/submissionVault";
import {
  derivedSubmissionId,
  recordSubmissionAfterResponse,
  type SubmissionRecord,
} from "@/lib/submissionLedger";

type ContactPayload = {
  name: string;
  company?: string;
  email: string;
  message: string;
  honeypot?: string;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * 設定欠落の検知用。本番の /media/api/contact に GET すると、送信せずに
 * Webhook が設定されているかだけを返す。
 *
 * 経緯: LARK_WEBHOOK_URL が Vercel に一度も設定されないまま公開されており、
 * フォームは表示されるのに送信だけが 500 で落ちていた（2026-09-21 実測）。
 * 表示側にエラーが出ないため誰も気づけなかった。週次ウォッチから叩いて監視する。
 */
export async function GET() {
  const configured = Boolean(process.env.LARK_WEBHOOK_URL);
  // 退避先も同じ経路で見る。未設定だと「Webhook が落ちた問い合わせ」がどこにも残らない。
  const vaultConfigured = Boolean(
    process.env.SUBMISSION_VAULT_URL && process.env.SUBMISSION_VAULT_SERVICE_KEY,
  );
  const ok = configured && vaultConfigured;
  return NextResponse.json(
    { ok, configured, vaultConfigured },
    { status: ok ? 200 : 503, headers: { "X-Robots-Tag": "noindex" } },
  );
}

export async function POST(req: Request) {
  // 受付台帳（Supabase submissions）。入力の不備（400）と bot を除き、成否に関わらず1件1行で残す（応答のあとに書く）
  let ledger: SubmissionRecord | null = null;
  const respond = (res: NextResponse) => {
    if (ledger) ledger.outcome = { ...ledger.outcome, http_status: res.status };
    return res;
  };
  try {
    const body = (await req.json()) as Partial<ContactPayload>;

    // honeypot はクライアント側だけだと API 直叩きの bot に効かない。同じ判定をここでも行う
    if (body.honeypot) {
      return NextResponse.json({ ok: true });
    }

    const name = (body.name || "").toString().trim();
    const company = (body.company || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const message = (body.message || "").toString().trim();

    const errors: string[] = [];
    if (!name) errors.push("お名前は必須です。");
    if (!email) errors.push("メールアドレスは必須です。");
    if (email && !isValidEmail(email)) errors.push("メールアドレスの形式が正しくありません。");
    if (!message || message.length < 10) errors.push("お問い合わせ内容は10文字以上で入力してください。");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    ledger = {
      source: "newmedia/contact",
      kind: "contact",
      submissionId: derivedSubmissionId("contact", [email.toLowerCase(), message]),
      applicant: { name, company, email, message: message.slice(0, 10000) },
      context: {
        request: {
          user_agent: req.headers.get("user-agent") ?? "",
          referer: req.headers.get("referer") ?? "",
        },
      },
      outcome: {},
    };

    const webhookUrl = process.env.LARK_WEBHOOK_URL;
    if (!webhookUrl) {
      // 2026-09-21 に実際に起きた形（未設定のまま公開）。ここを空けたままだと、
      // 「退避先はその最後の受け皿」と言いながら、いちばん必要な場面で1件も残らない。
      const reason = "LARK_WEBHOOK_URL not configured";
      const vaulted = await saveToSubmissionVault({
        source: "newmedia/contact",
        kind: "contact",
        reason,
        notified: false,
        payload: { name, company, email, message: message.slice(0, 2000) },
      });
      ledger.outcome = { notified: false, vault: { saved: vaulted, reason } };
      // 退避に残せたなら受付は済んでいる。通知は監視が退避から再送する。
      if (vaulted) return respond(NextResponse.json({ ok: true }));
      return respond(NextResponse.json({ error: "サーバー設定が不足しています。(WEBHOOK)" }, { status: 500 }));
    }

    const receivedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    // 利用者の入力がマークダウンやリンクとして解釈されないよう、記号は HTML 実体参照にしてから lark_md に埋める
    const escapeMd = (value: string) => value.replace(/[&*_~`[\]()<>#]/g, (c) => `&#${c.charCodeAt(0)};`);
    const field = (label: string, value: string) => ({
      is_short: true,
      text: { tag: "lark_md", content: `**${label}**\n${escapeMd(value)}` },
    });

    const payload = {
      msg_type: "interactive",
      card: {
        config: { wide_screen_mode: true },
        header: {
          template: "blue",
          title: { tag: "plain_text", content: "📩 新しいお問い合わせ（RIDE JOBメディア）" },
        },
        elements: [
          {
            tag: "div",
            fields: [field("お名前", name), field("会社名", company || "（未入力）")],
          },
          { tag: "div", fields: [field("メール", email)] },
          { tag: "hr" },
          { tag: "div", text: { tag: "lark_md", content: "**お問い合わせ内容**" } },
          // Lark の本文には上限がある。超えると送信失敗＝問い合わせが失われるので求人サイト側と同じ 2000 字で切る
          { tag: "div", text: { tag: "plain_text", content: message.slice(0, 2000) } },
          {
            tag: "note",
            elements: [{ tag: "plain_text", content: `受信: ${receivedAt} ／ ridejob.jp/media/contact` }],
          },
        ],
      },
    };

    const saved = { name, company, email, message: message.slice(0, 2000) };
    ledger.notification = { text: JSON.stringify(payload.card), sent: false, via: "webhook" };

    // ⚠️ ここは生の fetch なので、DNS失敗・接続断・TLSエラーは**例外**になる。
    // 下の catch は 400「不正なリクエストです」を返すので、そこまで落とすと
    // Lark 側の到達性障害＝退避がいちばん必要な場面で1件も残らない。ここで捕まえる。
    let larkRes: Response;
    try {
      larkRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
    } catch (sendError) {
      const detail = sendError instanceof Error ? `${sendError.name}: ${sendError.message}` : "unknown";
      const reason = `lark webhook unreachable: ${detail}`;
      const vaulted = await saveToSubmissionVault({
        source: "newmedia/contact",
        kind: "contact",
        reason,
        notified: false,
        payload: saved,
      });
      ledger.outcome = { notified: false, webhook_status: 0, vault: { saved: vaulted, reason } };
      // 退避に残せたなら、利用者にはエラーを見せない（送り直してもらっても通知は直らない）。
      if (vaulted) return respond(NextResponse.json({ ok: true }));
      return respond(
        NextResponse.json(
          { error: "外部送信に失敗しました。時間をおいて再度お試しください。" },
          { status: 502 }
        )
      );
    }

    const larkData = await larkRes.json().catch(() => ({}));

    if (!larkRes.ok || (larkData && typeof larkData.code !== "undefined" && larkData.code !== 0)) {
      // Larkは {code:0, msg:"ok"} が成功。その他は失敗扱い。
      // この通知が唯一の記録なので、落ちた時点で問い合わせは消える。退避に残してから返す。
      const reason = `lark webhook failed: http=${larkRes.status} code=${
        typeof larkData?.code === "undefined" ? "" : String(larkData.code)
      }`;
      const vaulted = await saveToSubmissionVault({
        source: "newmedia/contact",
        kind: "contact",
        reason,
        notified: false,
        payload: saved,
      });
      ledger.outcome = { notified: false, webhook_status: larkRes.status, vault: { saved: vaulted, reason } };
      if (vaulted) return respond(NextResponse.json({ ok: true }));
      return respond(
        NextResponse.json(
          { error: "外部送信に失敗しました。時間をおいて再度お試しください。" },
          { status: 502 }
        )
      );
    }

    ledger.notification.sent = true;
    ledger.outcome = { notified: true, webhook_status: larkRes.status };
    return respond(NextResponse.json({ ok: true }));
  } catch (err) {
    if (ledger) {
      ledger.outcome = {
        ...ledger.outcome,
        http_status: 400,
        error: err instanceof Error ? err.name : "error",
      };
    }
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  } finally {
    if (ledger) recordSubmissionAfterResponse(ledger);
  }
}
