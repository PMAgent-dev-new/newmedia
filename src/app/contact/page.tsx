"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import { withBasePath } from "@/lib/basePath";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const isValidEmail = (value: string) => {
    // RFC5322に完全準拠ではないが、実用的な簡易バリデーション
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const clientErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("お名前は必須です。");
    if (!email.trim()) errors.push("メールアドレスは必須です。");
    if (email.trim() && !isValidEmail(email.trim())) errors.push("メールアドレスの形式が正しくありません。");
    if (!message.trim() || message.trim().length < 10) errors.push("お問い合わせ内容は10文字以上で入力してください。");
    return errors;
  }, [name, email, message]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage(null);
    setServerError(null);

    if (honeypot) {
      // ボットとみなして静かに成功扱い
      setServerMessage("送信が完了しました。");
      return;
    }

    if (clientErrors.length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(withBasePath('/api/contact'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, email, message, honeypot }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data?.error || "送信に失敗しました。時間をおいて再度お試しください。");
      } else {
        setServerMessage("送信が完了しました。ご入力ありがとうございます。");
        setName("");
        setCompany("");
        setEmail("");
        setMessage("");
      }
    } catch {
      setServerError("ネットワークエラーが発生しました。接続状況をご確認ください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans min-h-screen">
      <Header />
      <Breadcrumbs pageName="お問い合わせ" />

      <main
        className="min-h-screen bg-repeat"
        style={{ backgroundImage: `url('${withBasePath('/figma/blue-bg.png')}')` }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">お問い合わせ</h1>

            <p className="text-gray-900 mb-6">
              採用や掲載、その他ご質問につきましては、以下のフォームよりお気軽にお問い合わせください。
            </p>

            {hasInteracted && clientErrors.length > 0 && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {clientErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {serverError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
            )}
            {serverMessage && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{serverMessage}</div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* ハニーポット（ユーザーには非表示） */}
              <div className="hidden">
                <label>
                  ご職業
                  <input
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setHasInteracted(true); setName(e.target.value); }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="山田 太郎"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">会社名（任意）</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => { setHasInteracted(true); setCompany(e.target.value); }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="株式会社PM Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setHasInteracted(true); setEmail(e.target.value); }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="taro@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => { setHasInteracted(true); setMessage(e.target.value); }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 h-40 resize-y text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="お問い合わせ内容をご記入ください"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || clientErrors.length > 0}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-white font-medium shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "送信中..." : "送信する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


