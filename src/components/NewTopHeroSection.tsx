import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/types/microcms";
import { fetchBlogsWithFallback } from "@/lib/blogHelpers";
import { CATEGORY_IDS } from "@/constants/categories";
import { withBasePath } from "@/lib/basePath";
import HeroEyecatchSlider from "@/components/HeroEyecatchSlider";
import LogoMarquee from "@/components/LogoMarquee";

const imgHero = "/figma/hero-bg.png";
const imgCombinedLogo = "/figma/center-illustration+title-logo.png";
const imgMobileLogo = "/figma/charamobile.png";
const fallbackThumb = "/figma/article-thumb.png";
const imgTopMainImgA2 = "/figma/main-person.png";
const imgPickupTitle = "/figma/ピックアップ.png";

/**
 * ブログカードコンポーネント
 */
function BlogCard({ blog }: { blog: Blog }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // タイトルが20文字を超える場合は省略記号を追加
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "…";
    }
    return title;
  };

  // スラッグがない場合はIDを使用、どちらもない場合は無効なリンクを防ぐ
  const linkHref = blog.slug ? `/blog/${blog.slug}` : (blog.id ? `/blog/${blog.id}` : '#');

  // IDもスラッグもない場合は警告を表示（開発環境のみ）
  if (process.env.NODE_ENV === 'development' && !blog.id && !blog.slug) {
    console.warn('BlogCard: blog.idとblog.slugの両方が存在しません', blog);
  }

  // 無効なリンクの場合はクリックを無効化
  if (linkHref === '#') {
    return (
      <div className="box-border content-stretch flex flex-row gap-3 md:gap-4 items-start justify-start p-2 relative shrink-0 w-full opacity-50 cursor-not-allowed rounded-lg">
        <div className="box-border content-stretch flex flex-row gap-2 h-[70px] md:h-[88px] items-start justify-start p-0 relative shrink-0 w-[70px] md:w-[93px]">
          <Image
            src={blog.eyecatch?.url || withBasePath(fallbackThumb)}
            alt={blog.title}
            width={70}
            height={70}
            className="rounded-[10px] object-cover w-full h-full md:w-[93px] md:h-[88px]"
            sizes="(max-width: 768px) 70px, 93px"
            loading="lazy"
          />
        </div>
        <div className="basis-0 box-border content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0">
          <div className="box-border content-stretch flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-start p-0 relative shrink-0 w-full">
            <div className="bg-[#2204db] box-border content-stretch flex flex-row items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[32px] shrink-0">
              <div className="flex flex-col font-medium justify-center relative shrink-0 text-xs text-center text-neutral-50 text-nowrap">
                <p className="block leading-[16px] whitespace-pre">
                  {blog.category?.name || "最新"}
                </p>
              </div>
            </div>
            <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0">
              <div className="flex flex-col font-[350] justify-center relative shrink-0 text-[#6a7282] text-xs text-left text-nowrap">
                <p className="block leading-[16px] whitespace-pre">
                  {formatDate(blog.publishedAt)}
                </p>
              </div>
            </div>
          </div>
          <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0 w-full">
            <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#101828] text-sm md:text-base text-left">
              <p className="block leading-[1.4] line-clamp-2">{truncateTitle(blog.title)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={linkHref} className="block w-full mb-4">
      <div className="box-border content-stretch flex flex-row gap-3 md:gap-4 items-start justify-start p-3 relative shrink-0 w-full cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg">
      <div className="box-border content-stretch flex flex-row gap-2 h-[70px] md:h-[88px] items-start justify-start p-0 relative shrink-0 w-[70px] md:w-[93px]">
        <Image
          src={blog.eyecatch?.url || withBasePath(fallbackThumb)}
          alt={blog.title}
          width={70}
          height={70}
          className="rounded-[10px] object-cover w-full h-full md:w-[93px] md:h-[88px]"
          sizes="(max-width: 768px) 70px, 93px"
          loading="lazy"
        />
      </div>
      <div className="basis-0 box-border content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0">
        <div className="box-border content-stretch flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-start p-0 relative shrink-0 w-full">
          <div className="bg-[#2204db] box-border content-stretch flex flex-row items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[32px] shrink-0">
            <div className="flex flex-col font-medium justify-center relative shrink-0 text-xs text-center text-neutral-50 text-nowrap">
              <p className="block leading-[16px] whitespace-pre">
                {blog.category?.name || "最新"}
              </p>
            </div>
          </div>
          <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0">
            <div className="flex flex-col font-[350] justify-center relative shrink-0 text-[#6a7282] text-xs text-left text-nowrap">
              <p className="block leading-[16px] whitespace-pre">
                {formatDate(blog.publishedAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0 w-full">
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#101828] text-sm md:text-base text-left">
            <p className="block leading-[1.4] line-clamp-2">{truncateTitle(blog.title)}</p>
          </div>
        </div>
      </div>
      </div>
    </Link>
  );
}

/**
 * データがない場合のプレースホルダー
 */
function EmptyPlaceholder() {
  return (
    <div className="box-border content-stretch flex flex-col gap-4 items-center justify-center h-full p-4 text-center">
      <div className="text-gray-500 font-medium">記事を読み込み中...</div>
    </div>
  );
}

/**
 * ヒーローセクション - トップページのメインビジュアル
 */
export default async function NewTopHeroSection() {
  const blogs = await fetchBlogsWithFallback(CATEGORY_IDS.PICKUP, 6);
  const rightBlogs = await fetchBlogsWithFallback(CATEGORY_IDS.COMPANY_INTERVIEW, 5);
  const rightImages = rightBlogs.map((b) => ({
    src: b.eyecatch?.url || withBasePath(fallbackThumb),
    alt: b.title,
  }));
  
  const leftColumn = blogs.slice(0, 3);
  const rightColumn = blogs.slice(3, 6);
  const mobileBlogs = blogs.slice(0, 3); // モバイル版は3記事のみ

  return (
    <>
      {/* モバイル・タブレット専用レイアウト */}
      <div className="lg:hidden">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start px-4 md:px-9 py-[29px] relative w-full min-h-screen">
          {/* 背景画像 */}
          <div
            className="-z-10 absolute inset-0"
            style={{
              backgroundImage: `url(${withBasePath(imgHero)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="flex flex-col gap-5 items-start justify-start w-full relative z-10">
            {/* タイトルロゴとイラスト */}
            <div className="w-full">
              {/* モバイル専用画像 */}
              <div className="block md:hidden">
                <Image
                  src={withBasePath(imgMobileLogo)}
                  alt="モバイル用ロゴ"
                  width={202}
                  height={329}
                  className="w-full h-auto"
                  priority
                  sizes="(max-width: 768px) 100vw"
                />
              </div>
              {/* タブレット以上で統合画像 */}
              <div className="hidden md:block">
                <Image
                  src={withBasePath(imgCombinedLogo)}
                  alt="タブレット用ロゴ"
                  width={665}
                  height={266}
                  className="w-full h-auto"
                  priority
                  sizes="(max-width: 1024px) 100vw"
                />
              </div>
            </div>

            {/* ピックアップ記事一覧 */}
            <div className="flex flex-col gap-4 w-full p-4 bg-white border-2 border-black rounded-3xl max-h-[380px] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
              {/* ピックアップタイトル */}
              <div className="flex justify-center">
                <Image
                  src={withBasePath(imgPickupTitle)}
                  alt="ピックアップ"
                  width={240}
                  height={60}
                  className="h-[60px] w-[240px]"
                  loading="lazy"
                  sizes="240px"
                />
              </div>

              {mobileBlogs.length === 0 ? (
                <div className="text-center p-6">
                  <div className="text-gray-500 font-medium">記事を読み込み中...</div>
                </div>
              ) : (
                mobileBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PC専用レイアウト */}
      <div className="hidden lg:block">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start px-4 md:px-9 py-[29px] relative w-full">
          {/* 背景画像 */}
          <div
            className="-z-10 absolute inset-0"
            style={{
              backgroundImage: `url(${withBasePath(imgHero)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="flex flex-row gap-5 items-start justify-start w-full relative z-10">
            <div className="flex-1 max-w-[50%]">
              {/* タイトルロゴとイラスト */}
              <div className="w-full mb-5">
                <Image
                  src={withBasePath(imgCombinedLogo)}
                  alt="PC用ロゴ"
                  width={665}
                  height={266}
                  className="w-full h-auto"
                  priority
                  sizes="50vw"
                />
              </div>

              {/* ピックアップ記事一覧 */}
              <div className="w-full bg-white border-2 border-black rounded-3xl p-6">
                {/* ピックアップタイトル */}
                <div className="flex justify-center w-full mb-4">
                  <Image
                    src={withBasePath(imgPickupTitle)}
                    alt="ピックアップ"
                    width={320}
                    height={80}
                    className="h-[80px] w-[320px]"
                    loading="lazy"
                    sizes="320px"
                  />
                </div>

                {blogs.length === 0 ? (
                  <EmptyPlaceholder />
                ) : (
                  <div className="flex flex-row gap-6 w-full">
                    {/* 左カラム */}
                    <div className="flex-1 flex flex-col gap-4">
                      {leftColumn.map((blog) => (
                        <div key={blog.id} className="w-full">
                          <BlogCard blog={blog} />
                        </div>
                      ))}
                    </div>
                    {/* 右カラム */}
                    <div className="flex-1 flex flex-col gap-4">
                      {rightColumn.map((blog) => (
                        <div key={blog.id} className="w-full">
                          <BlogCard blog={blog} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右側のメイン画像（スライダー） */}
            <div className="flex-1 max-w-[50%] self-stretch">
              {rightImages.length > 0 ? (
                // クライアントコンポーネントを動的に読み込む必要はない（サーバー側でデータを整形）
                // ヒーロー右側をアイキャッチスライダーに置き換え
                <HeroEyecatchSlider images={rightImages} intervalMs={3000} />
              ) : (
                <Image
                  src={withBasePath(imgTopMainImgA2)}
                  alt="メイン画像"
                  fill
                  className="object-contain rounded-lg"
                  loading="lazy"
                  sizes="50vw"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 企業ロゴ マルキー */}
      <LogoMarquee />
    </>
  );
}