import React from 'react';
import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';
import Link from 'next/link';
import { Blog } from '@/types/microcms';
import { fetchBlogsWithFallback } from '@/lib/blogHelpers';
import { CATEGORY_IDS, categoryPathById } from '@/constants/categories';

const imgSection2CompanyInterview = "/figma/company-interview-bg.png";
const imgHeading021 = "/figma/heading-02.png";
const imgDsgf1 = "/figma/50s-man.png";
const fallbackImage = "/figma/news-card-image-82.png";
const imgButtonIcon = "/figma/arrow-group3.svg";

/**
 * 企業インタビュー記事カード
 */
function InterviewCard({ blog }: { blog: Blog }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // タイトルを20文字で省略
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // 本文からプレーンテキストの抜粋を生成（content > html の優先順）
  const getExcerpt = (maxLength: number = 100) => {
    const source = blog.content || blog.html || '';
    const text = source.replace(/<[^>]*>/g, '');
    if (text.length === 0) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // ブログのスラッグまたはIDでリンクを生成
  const blogLink = blog.slug ? `/blog/${blog.slug}` : `/blog/${blog.id}`;

  return (
    <Link href={blogLink} className="block group">
      <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-4 h-[413px] md:h-[380px] lg:h-[520px] items-start justify-start p-[16px] md:p-[16px] lg:p-[20px] relative rounded-[20px] shrink-0 w-full max-w-[349px] md:max-w-[349px] lg:max-w-[460px] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <div
          aria-hidden="true"
          className="absolute border-[#333333] border-[1.2px] border-solid inset-0 pointer-events-none rounded-[20px] group-hover:border-[#2204db] transition-colors duration-200"
        />
                  <div className="box-border content-stretch flex flex-col gap-[17px] lg:gap-[20px] h-full items-start justify-start p-0 relative shrink-0 w-full">
            {/* アイキャッチ画像をImageで最適化 */}
            <Image
              src={withBasePath(blog.eyecatch?.url || fallbackImage)}
              alt={blog.title}
              width={349}
              height={235}
              className="h-[235px] md:h-[200px] lg:h-[240px] rounded-[10px] w-full object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 349px, (max-width: 1024px) 349px, 460px"
            />
          <div className="box-border content-stretch flex flex-col gap-4 lg:gap-6 items-start justify-start p-0 relative shrink-0 w-full">
            <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
              <div className="bg-[#2204db] box-border content-stretch flex flex-row items-center justify-center overflow-clip px-3 py-[3px] lg:px-5 lg:py-[5px] relative rounded-[32px] shrink-0">
                <div className="flex flex-col font-medium justify-center relative shrink-0 text-xs lg:text-sm text-center text-neutral-50 text-nowrap">
                  <p className="block leading-[16px] lg:leading-[20px] whitespace-pre">
                    {blog.category?.name || '企業取材'}
                  </p>
                </div>
              </div>
              <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0">
                <div className="flex flex-col font-[350] justify-center relative shrink-0 text-[#6a7282] text-xs text-left text-nowrap">
                  <p className="block leading-[16px] lg:leading-[20px] whitespace-pre">
                    {formatDate(blog.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="box-border content-stretch flex flex-col gap-2 lg:gap-3 items-start justify-start leading-[0] p-0 relative shrink-0 w-full">
              <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#101828] text-lg md:text-base lg:text-xl text-left w-full">
                <p className="block leading-[20px] lg:leading-[24px] group-hover:text-[#2204db] transition-colors duration-200">
                  {truncateTitle(blog.title)}
                </p>
              </div>
              <div className="flex flex-col font-normal justify-center relative shrink-0 text-[#4a5565] text-sm md:text-xs lg:text-base text-justify w-full">
                {/* Mobile: 20文字に省略 */}
                <p className="block md:hidden leading-[1.5]">
                  {getExcerpt(20)}
                </p>
                {/* Tablet and up: 100文字相当 + 行数制限 */}
                <p className="hidden md:block leading-[1.5] line-clamp-3 lg:line-clamp-4">
                  {getExcerpt(100)}
                </p>
              </div>
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
function EmptyCard() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-4 h-[413px] md:h-[380px] lg:h-[520px] items-start justify-start p-[16px] md:p-[16px] lg:p-[20px] relative rounded-[20px] shrink-0 w-full max-w-[349px] md:max-w-[349px] lg:max-w-[460px] opacity-50">
      <div
        aria-hidden="true"
        className="absolute border-[#333333] border-[1.2px] border-solid inset-0 pointer-events-none rounded-[20px]"
      />
      <div className="box-border content-stretch flex flex-col gap-[17px] h-full items-center justify-center p-0 relative shrink-0 w-full">
        <div className="bg-gray-200 h-[235px] md:h-[200px] lg:h-[240px] rounded-[10px] shrink-0 w-full" />
        <div className="text-center text-gray-500 text-sm lg:text-base">記事を準備中...</div>
      </div>
    </div>
  );
}

/**
 * 企業インタビューセクション - 企業取材記事を動的表示
 */
export default async function CompanyInterviewSection() {
  const blogs = await fetchBlogsWithFallback(CATEGORY_IDS.COMPANY_INTERVIEW, 4);

  return (
    <div className="box-border content-stretch flex flex-col items-center justify-center pb-12 md:pb-16 lg:pb-24 pt-16 md:pt-24 lg:pt-[140px] px-4 md:px-8 lg:px-[170px] relative w-full min-h-screen">
      {/* 背景画像 */}
      <div
        className="-z-10 absolute inset-0"
        style={{
          backgroundImage: `url(${withBasePath(imgSection2CompanyInterview)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-10 items-center lg:items-start justify-center w-full">
          
          {/* Title and Character Section */}
          <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 items-center lg:items-start justify-start shrink-0">
            {/* 見出し画像をImageで最適化 */}
            <Image
              src={withBasePath(imgHeading021)}
              alt="企業取材"
              width={320}
              height={200}
              className="w-[320px] md:w-[300px] lg:w-[300px] h-[200px] md:h-[180px] lg:h-[220px] object-contain"
              loading="lazy"
              sizes="(max-width: 768px) 320px, (max-width: 1024px) 300px, 300px"
            />
            {/* キャラクター画像をImageで最適化 */}
            <Image
              src={withBasePath(imgDsgf1)}
              alt="キャラクター"
              width={170}
              height={300}
              className="w-[170px] md:w-[220px] lg:w-[312px] h-[300px] md:h-[400px] lg:h-[557px] object-cover hidden md:block"
              loading="lazy"
              sizes="(max-width: 1024px) 220px, 312px"
            />
          </div>
          
          {/* Cards Section */}
          <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 items-center justify-center w-full lg:flex-1">
            {/* Desktop: 2x2 Grid, Mobile: Single Column (3 items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-6 w-full max-w-none md:max-w-[750px] lg:max-w-[960px] justify-items-center">
              {blogs.length >= 1 && <InterviewCard blog={blogs[0]} />}
              {blogs.length >= 2 ? <InterviewCard blog={blogs[1]} /> : <EmptyCard />}
              {blogs.length >= 3 ? <InterviewCard blog={blogs[2]} /> : <EmptyCard />}
              <div className="hidden md:block">
                {blogs.length >= 4 ? <InterviewCard blog={blogs[3]} /> : <EmptyCard />}
              </div>
            </div>
            
            {/* Button */}
            <div className="flex flex-col items-center justify-center mt-4 md:mt-6 lg:mt-8">
              <Link href={categoryPathById(CATEGORY_IDS.COMPANY_INTERVIEW)} className="block">
                <div className="bg-[#027a9c] box-border content-stretch flex flex-row gap-4 items-center justify-center pl-6 pr-4 py-4 relative rounded-[58px] shrink-0 cursor-pointer shadow-[4px_4px_0px_0px_rgba(19,19,19,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(19,19,19,0.3)] transition-shadow">
                  <div
                    aria-hidden="true"
                    className="absolute border-[#333333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[58px]"
                  />
                  <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#ffffff] text-base md:text-lg text-center text-nowrap tracking-[0.36px]">
                    <p className="adjustLetterSpacing block leading-[normal] whitespace-pre">
                      企業取材をもっと見る
                    </p>
                  </div>
                  <div className="flex h-[31.984px] items-center justify-center relative shrink-0 w-[32px]">
                    <div className="flex-none rotate-[270deg]">
                      <Image
                        src={withBasePath(imgButtonIcon)}
                        alt="矢印アイコン"
                        width={32}
                        height={32}
                        className="size-8"
                        loading="lazy"
                        sizes="32px"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}