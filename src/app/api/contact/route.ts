import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  company?: string;
  email: string;
  message: string;
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
  return NextResponse.json({ ok: configured, configured }, { status: configured ? 200 : 503 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ContactPayload>;

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

    const webhookUrl = process.env.LARK_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: "サーバー設定が不足しています。(WEBHOOK)" }, { status: 500 });
    }

    const textLines: string[] = [
      "お問い合わせが届きました",
      `お名前: ${name}`,
      company ? `会社名: ${company}` : undefined,
      `メール: ${email}`,
      "内容:",
      message,
    ].filter((line): line is string => typeof line === "string");

    const payload = {
      msg_type: "text",
      content: { text: textLines.join("\n") },
    };

    const larkRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 5秒程度でタイムアウト（Next.jsの標準fetchにsignalは渡さないが、runtime側で十分短い）
    });

    const larkData = await larkRes.json().catch(() => ({}));

    if (!larkRes.ok || (larkData && typeof larkData.code !== "undefined" && larkData.code !== 0)) {
      // Larkは {code:0, msg:"ok"} が成功。その他は失敗扱い
      return NextResponse.json(
        { error: "外部送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }
}
