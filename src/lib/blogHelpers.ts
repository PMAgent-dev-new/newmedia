import { Blog } from "@/types/microcms";
import { CARD_FIELDS, getBlogsByCategory, getLatestBlogs } from "./microcms";

/**
 * カテゴリでブログを取得し、取得できない場合はフォールバックする
 * @param categoryId カテゴリID
 * @param limit 取得件数
 * @returns Blog[]
 */
export async function fetchBlogsWithFallback(
  categoryId: string,
  limit: number = 6,
  // 既定は一覧カード用のフィールドだけ。本文が要る面（抜粋を出す CompanyInterviewSection）
  // だけが content/html を足して呼ぶ。既定で本文まで取ると転送量が跳ねる（microcms.ts の CARD_FIELDS 参照）
  fields: string = CARD_FIELDS
): Promise<Blog[]> {
  try {
    // 1. APIフィルタリングを試行
    const response = await getBlogsByCategory(categoryId, limit, fields);
    if (response.contents && response.contents.length > 0) {
      return response.contents;
    }

    // 2. クライアントサイドフィルタリングを試行
    // 本文込みで呼ばれた場合に50件取ると 1.16MB 前後になり、Next のデータキャッシュ上限
    // （1エントリ2MB）に触れて「警告だけ出してキャッシュしない」状態になりうる
    // （allBlogs.ts の実測参照）。その場合だけ件数を絞る。
    const scanLimit = fields === CARD_FIELDS ? 50 : 20;
    const allResponse = await getLatestBlogs(scanLimit, fields);
    const filteredBlogs = allResponse.contents?.filter(blog => 
      blog.category?.id === categoryId
    ) || [];
    
    if (filteredBlogs.length > 0) {
      return filteredBlogs.slice(0, limit);
    }

    // 3. 最新記事をフォールバック
    const latestResponse = await getLatestBlogs(limit, fields);
    return latestResponse.contents || [];
    
  } catch {
    // エラー時は最新記事を返す
    try {
      const latestResponse = await getLatestBlogs(limit, fields);
      return latestResponse.contents || [];
    } catch {
      return [];
    }
  }
}

/**
 * 現在の記事に関連する記事を取得する
 * 優先順位:
 * 1. 同カテゴリの公開記事
 * 2. 不足分を最新記事で補完
 */
export async function getRelatedBlogs(currentBlog: Blog, limit: number = 3): Promise<Blog[]> {
  const currentId = currentBlog.id;
  const currentSlug = currentBlog.slug;
  const categoryId = currentBlog.category?.id;
  const relatedBlogs: Blog[] = [];
  const seenIds = new Set<string>();

  const isSameBlog = (blog: Blog) =>
    blog.id === currentId || (Boolean(currentSlug) && blog.slug === currentSlug);

  const appendUniqueBlogs = (blogs: Blog[]) => {
    for (const blog of blogs) {
      if (relatedBlogs.length >= limit) break;
      if (isSameBlog(blog)) continue;
      if (seenIds.has(blog.id)) continue;
      seenIds.add(blog.id);
      relatedBlogs.push(blog);
    }
  };

  if (categoryId) {
    try {
      const categoryResponse = await getBlogsByCategory(categoryId, Math.max(limit + 1, 6));
      appendUniqueBlogs(categoryResponse.contents || []);
    } catch {
      // 同カテゴリ取得失敗時は最新記事補完にフォールバック
    }
  }

  if (relatedBlogs.length < limit) {
    try {
      const latestResponse = await getLatestBlogs(Math.max(limit + 3, 8));
      appendUniqueBlogs(latestResponse.contents || []);
    } catch {
      return relatedBlogs;
    }
  }

  return relatedBlogs;
}
