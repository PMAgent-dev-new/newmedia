import Link from 'next/link';
import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';
import { Category } from '@/types/microcms';

interface NewCategorySectionProps {
  categories: Category[];
}

const imgSection3Category = "/figma/category-bg.png";
const imgFrame683 = "/figma/category-title.png";
const imgGroup20611 = "/figma/category-character.png";
const imgFrame471 = "/figma/category-card1.png";
const imgFrame481 = "/figma/category-card2.png";
const imgFrame461 = "/figma/category-card3.png";
const imgFrame491 = "/figma/category-card4.png";

export default function NewCategorySection({ categories }: NewCategorySectionProps) {
  // カテゴリ名からIDを取得するヘルパー関数
  const getCategoryId = (categoryName: string): string | undefined => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.id;
  };
  return (
    <div className="box-border content-stretch flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center pb-8 lg:pb-0 px-4 md:px-8 lg:pl-[150px] lg:pr-[72px] pt-16 lg:pt-20 relative w-full min-h-screen">
      {/* 背景画像 */}
      <div
        className="-z-10 absolute inset-0"
        style={{
          backgroundImage: `url(${withBasePath(imgSection3Category)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="box-border content-stretch flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start justify-center lg:justify-start p-0 relative shrink-0 w-full lg:w-auto relative z-10"
        id="node-2151_195"
      >
        <div
          className="box-border content-stretch flex flex-col gap-8 lg:gap-[173px] items-center lg:items-start justify-center p-0 relative shrink-0"
          id="node-2151_417"
        >
          <div
            className="box-border content-stretch flex flex-col gap-6 lg:gap-10 items-center lg:items-start justify-start p-0 relative shrink-0"
            id="node-2151_196"
          >
            <div
              className="box-border content-stretch flex flex-col gap-6 items-center lg:items-start justify-start p-0 relative shrink-0"
              data-name="heading03"
              id="node-2151_200"
            >
              {/* 見出し画像をImageで最適化 */}
              <Image
                src={withBasePath(imgFrame683)}
                alt="カテゴリー見出し"
                width={280}
                height={180}
                className="w-[280px] md:w-[320px] lg:w-[376px] h-[180px] md:h-[240px] lg:h-[273px] object-contain"
                loading="lazy"
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 376px"
              />
            </div>
          </div>
          <div
            className="box-border content-stretch flex flex-col gap-4 items-center lg:items-start justify-start p-0 relative shrink-0"
            id="node-2151_418"
          >
            {/* キャラクター画像をImageで最適化 */}
            <Image
              src={withBasePath(imgGroup20611)}
              alt="キャラクター"
              width={280}
              height={400}
              className="w-[280px] md:w-[320px] lg:w-[367.5px] h-[400px] md:h-[500px] lg:h-[595px] object-contain"
              loading="lazy"
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 367.5px"
            />
          </div>
        </div>
      </div>
      <div
        className="flex flex-col gap-4 md:gap-6 items-center lg:items-start justify-center w-full min-w-0 flex-1 lg:w-auto lg:flex-initial"
        id="node-2151_1328"
      >
        <Link
          href={`/blog?category=${getCategoryId('ご利用者様の声') || ''}`}
          className="block hover:opacity-80 transition-opacity"
        >
          {/* カテゴリカードをImageで最適化 */}
          <Image
            src={withBasePath(imgFrame471)}
            alt="ご利用者様の声"
            width={680}
            height={222}
            className="min-h-[120px] h-[150px] md:h-[200px] lg:h-[222px] w-full min-w-0 max-w-[400px] mx-auto lg:max-w-none lg:w-[680px] lg:mx-0 object-contain cursor-pointer"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 680px"
          />
        </Link>
        <Link
          href={`/blog?category=${getCategoryId('お役立ち情報') || ''}`}
          className="block hover:opacity-80 transition-opacity"
        >
          <Image
            src={withBasePath(imgFrame481)}
            alt="お役立ち情報"
            width={680}
            height={222}
            className="min-h-[120px] h-[150px] md:h-[200px] lg:h-[222px] w-full min-w-0 max-w-[400px] mx-auto lg:max-w-none lg:w-[680px] lg:mx-0 object-contain cursor-pointer"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 680px"
          />
        </Link>
        <Link
          href={`/blog?category=${getCategoryId('企業取材') || ''}`}
          className="block hover:opacity-80 transition-opacity"
        >
          <Image
            src={withBasePath(imgFrame461)}
            alt="企業取材"
            width={680}
            height={222}
            className="min-h-[120px] h-[150px] md:h-[200px] lg:h-[222px] w-full min-w-0 max-w-[400px] mx-auto lg:max-w-none lg:w-[680px] lg:mx-0 object-contain cursor-pointer"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 680px"
          />
        </Link>
        <Link
          href={`/blog?category=${getCategoryId('インタビュー') || ''}`}
          className="block hover:opacity-80 transition-opacity"
        >
          <Image
            src={withBasePath(imgFrame491)}
            alt="インタビュー"
            width={680}
            height={222}
            className="min-h-[120px] h-[150px] md:h-[200px] lg:h-[222px] w-full min-w-0 max-w-[400px] mx-auto lg:max-w-none lg:w-[680px] lg:mx-0 object-contain cursor-pointer"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 680px"
          />
        </Link>
      </div>
    </div>
  );
}