import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import BlogCTASection from "@/components/BlogCTASection";
import { getVideoArticles } from "@/lib/videoArticles";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "動画で見る｜タクシー・ドライバーの仕事",
  description:
    "RIDE JOBのYouTubeチャンネルで解説している内容を、記事とあわせて見られるようまとめました。会社の選び方・面接・収入の考え方など、求人票からは読み取れない話を現場の担当者が話しています。",
  alternates: { canonical: "/media/videos" },
};

/**
 * 「動画で見る」一覧。
 *
 * 記事のカテゴリは主題のまま（お役立ち情報など）にして、動画つき記事への横断入口だけを作る。
 * 動画のためのカテゴリを新設すると、求職者が主題で辿る導線と二重になって割れるため。
 * 収集は本文のYouTubeリンクを見るだけなので、記事に動画を足せば自動でここに並ぶ。
 */
export default async function VideosPage() {
  const items = await getVideoArticles();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">動画で見る</h1>
          <p className="mt-3 text-gray-700 leading-relaxed">
            RIDE JOBのYouTubeチャンネルで解説している内容を、記事とあわせて見られるようにまとめました。
            会社の選び方、面接で見られていること、収入の考え方など、
            求人票の数字からは読み取れない話を、実際に転職相談を受けている担当者が話しています。
          </p>
          <p className="mt-2 text-sm text-gray-500">現在 {items.length} 本</p>
        </header>

        {items.length === 0 ? (
          <p className="text-gray-500">動画つきの記事はまだありません。</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/blog/${v.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-400"
                >
                  {/* サムネイルはYouTube側の静的画像を使う（記事のアイキャッチより動画だと分かりやすい） */}
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                      動画あり
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="font-bold text-gray-900 group-hover:underline">{v.title}</h2>
                    {v.heading && (
                      <p className="mt-2 text-sm text-gray-600">動画で見る：{v.heading}</p>
                    )}
                    <time className="mt-auto pt-3 text-xs text-gray-500" dateTime={v.publishedAt}>
                      {v.publishedAt.slice(0, 10).replace(/-/g, "/")}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-12 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">記事の一覧から探す</h2>
          <p className="mt-2 text-gray-700">
            動画のない記事も含めて、仕事内容・年収・資格・会社の選び方をまとめています。
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-800 hover:border-gray-500"
          >
            記事一覧を見る
          </Link>
        </section>
      </main>
      <BlogCTASection />
      <Footer />
    </div>
  );
}
