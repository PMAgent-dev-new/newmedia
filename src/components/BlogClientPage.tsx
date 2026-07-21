'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import BlogListSection from '@/components/BlogListSection';
import BlogSidebar from '@/components/BlogSidebar';
import { Blog, Category } from '@/types/microcms';

interface BlogClientPageProps {
  blogs: Blog[];
  categories: Category[];
  pickupArticles: Blog[];
  /** サーバー側でURLの ?category から解決した初期カテゴリ（初回描画から確実に絞り込むため） */
  initialCategory?: string | null;
}

export default function BlogClientPage({ blogs, categories, pickupArticles, initialCategory = null }: BlogClientPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URLパラメータからカテゴリを取得（初期値はサーバー解決分を採用し、初回描画から絞り込む）
  const categoryParam = searchParams.get('category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );

  // URLパラメータが変更された時にselectedCategoriesを更新
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    
    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryIds.length > 0) {
      // 複数カテゴリ選択の場合は最初のもののみをURLに反映
      params.set('category', categoryIds[0]);
    } else {
      params.delete('category');
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* メインコンテンツエリア */}
      <BlogListSection
        blogs={blogs}
        selectedCategories={selectedCategories}
        loading={false}
      />
      
      {/* サイドバー（デスクトップのみ表示） */}
      <aside className="hidden lg:block lg:order-last">
        <BlogSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          pickupArticles={pickupArticles}
        />
      </aside>
    </div>
  );
}