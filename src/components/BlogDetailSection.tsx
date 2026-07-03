'use client';

import Image from 'next/image';
import { Blog } from '@/types/microcms';
import TableOfContents from './TableOfContents';

interface BlogDetailSectionProps {
  blog: Blog;
}

export default function BlogDetailSection({ blog }: BlogDetailSectionProps) {
  const rawBlogStyle: unknown = blog['blog-style'];
  const normalizedBlogStyle = (() => {
    if (typeof rawBlogStyle === 'string') {
      return rawBlogStyle.toLowerCase();
    }

    if (typeof rawBlogStyle === 'number') {
      return String(rawBlogStyle).toLowerCase();
    }

    if (Array.isArray(rawBlogStyle)) {
      const first = rawBlogStyle[0];
      if (typeof first === 'string') {
        return first.toLowerCase();
      }
      if (typeof first === 'number') {
        return String(first).toLowerCase();
      }
      if (first && typeof first === 'object') {
        const value = (first as { value?: unknown; id?: unknown }).value ?? (first as { id?: unknown }).id;
        if (typeof value === 'string') {
          return value.toLowerCase();
        }
      }
    }

    if (rawBlogStyle && typeof rawBlogStyle === 'object') {
      const value = (rawBlogStyle as { value?: unknown; id?: unknown }).value ?? (rawBlogStyle as { id?: unknown }).id;
      if (typeof value === 'string') {
        return value.toLowerCase();
      }
    }

    return 'chat';
  })();
  const blogStyle = normalizedBlogStyle === 'editorial' ? 'editorial' : 'chat';
  const htmlVariantClass =
    blogStyle === 'editorial'
      ? 'article-content-html--editorial'
      : 'article-content-html--chat';

  // 公開日をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <article className="w-full">
      {/* 記事ヘッダー */}
      <header className="mb-8">
        {/* カテゴリタグ */}
        {blog.category && (
          <div className="mb-4">
            <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {blog.category.name}
            </span>
          </div>
        )}

        {/* 記事タイトル */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* 公開日 */}
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            公開日:{' '}
            <time dateTime={blog.publishedAt}>
              {formatDate(blog.publishedAt)}
            </time>
          </span>
          {blog.updatedAt && blog.updatedAt !== blog.publishedAt && (
            <span>
              更新日:{' '}
              <time dateTime={blog.updatedAt}>
                {formatDate(blog.updatedAt)}
              </time>
            </span>
          )}
        </div>

        {/* アイキャッチ画像 */}
        {blog.eyecatch && (
          <div className="mb-8">
            <Image
              src={blog.eyecatch.url}
              alt={blog.title}
              width={blog.eyecatch.width || 800}
              height={blog.eyecatch.height || 400}
              className="w-full h-auto shadow-sm"
              priority
            />
          </div>
        )}
      </header>

      {/* 目次 */}
      {(blog.html || blog.content) && (
        <TableOfContents content={blog.html || blog.content || ''} />
      )}

      {/* 記事本文 */}
      <div className="max-w-none">
        {blog.html ? (
          <div 
            className={`article-content-html ${htmlVariantClass} text-gray-900`}
            dangerouslySetInnerHTML={{ __html: blog.html }}
          />
        ) : blog.content ? (
          <div 
            className="article-content text-gray-900"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <p className="text-gray-500">記事の内容が見つかりません。</p>
        )}
      </div>
    </article>
  );
}
