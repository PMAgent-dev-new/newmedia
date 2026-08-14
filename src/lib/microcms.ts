import { BlogsResponse, MembersResponse, JobsResponse, Blog, LogosResponse } from "@/types/microcms";

// 環境変数の確認とフォールバック
const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return fallback || '';
  }
  return value;
};

// サーバーサイドとクライアントサイドの両方に対応
const API_KEY = getEnvVar('MICROCMS_API_KEY') || getEnvVar('NEXT_PUBLIC_MICROCMS_API_KEY');
const SERVICE_DOMAIN = getEnvVar('MICROCMS_SERVICE_DOMAIN') || getEnvVar('NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN');
const BASE_URL = SERVICE_DOMAIN ? `https://${SERVICE_DOMAIN}.microcms.io/api/v1` : '';

// 求人専用のmicroCMS設定
const JOB_API_KEY = getEnvVar('MICROCMS_API_KEY_2');
const JOB_SERVICE_DOMAIN = getEnvVar('MICROCMS_SERVICE_DOMAIN_2');
const JOB_BASE_URL = JOB_SERVICE_DOMAIN ? `https://${JOB_SERVICE_DOMAIN}.microcms.io/api/v1` : '';

// 初期化時の環境変数チェック
console.log('MicroCMS Configuration:', {
  API_KEY: API_KEY ? 'Set' : 'Not set',
  SERVICE_DOMAIN,
  BASE_URL,
  JOB_API_KEY: JOB_API_KEY ? 'Set' : 'Not set',
  JOB_SERVICE_DOMAIN,
  JOB_BASE_URL
});

/**
 * 最新ブログを取得（公開日順）
 * @param limit 取得件数（デフォルト: 6）
 * @returns BlogsResponse
 */
export async function getLatestBlogs(limit: number = 6): Promise<BlogsResponse> {
  // 環境変数の検証
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.error('MicroCMS environment variables are not properly configured');
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }

  console.log('Environment check:', {
    SERVICE_DOMAIN,
    API_KEY: API_KEY ? 'Set' : 'Not set',
    BASE_URL
  });

  const url = `${BASE_URL}/blogs?limit=${limit}&orders=-publishedAt`;
  console.log('Fetching from URL:', url);

  try {
    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch blogs: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }
}

/**
 * 特定カテゴリのブログを取得
 * @param categoryId カテゴリのコンテンツID（例: "2"）
 * @param limit 取得件数（デフォルト: 6）
 * @returns BlogsResponse
 */
export async function getBlogsByCategory(
  categoryId: string,
  limit: number = 6
): Promise<BlogsResponse> {
  // 環境変数の検証
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.error('MicroCMS environment variables are not properly configured');
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }

  try {
    const filters = encodeURIComponent(`category[equals]${categoryId}`);
    const url = `${BASE_URL}/blogs?filters=${filters}&limit=${limit}&orders=-publishedAt`;
    console.log('Fetching category blogs from URL:', url);

    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    console.log('Category blogs response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Category blogs API Error Response:', errorText);
      throw new Error(`Failed to fetch blogs by category: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Category blogs Network or parsing error:', error);
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }
}

/**
 * 全メンバーを取得
 * @param limit 取得件数（デフォルト: 10）
 * @returns MembersResponse
 */
export async function getAllMembers(limit: number = 10): Promise<MembersResponse> {
  const url = `${BASE_URL}/member?limit=${limit}&orders=-publishedAt`;

  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch members: ${res.status}`);
  }

  return res.json();
}

/**
 * 最新求人を取得（公開日順）
 * @param limit 取得件数（デフォルト: 4）
 * @returns JobsResponse
 */
export async function getLatestJobs(limit: number = 4): Promise<JobsResponse> {
  const url = `${JOB_BASE_URL}/jobs?limit=${limit}&orders=-publishedAt`;

  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": JOB_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status}`);
  }

  return res.json();
}

/**
 * 給与の高い順に求人を取得（給与上限 salaryMax の降順）
 * @param limit 取得件数（デフォルト: 3）
 * @param categoryIds 職種カテゴリーID（指定時はいずれかに一致する求人のみ）
 *   例: タクシードライバー=6 / ハイヤードライバー=4
 * @returns JobsResponse
 */
export async function getTopSalaryJobs(
  limit: number = 3,
  categoryIds?: string[],
): Promise<JobsResponse> {
  let url = `${JOB_BASE_URL}/jobs?limit=${limit}&orders=-salaryMax`;
  if (categoryIds && categoryIds.length > 0) {
    const filter = categoryIds.map((id) => `jobCategory[equals]${id}`).join("[or]");
    url += `&filters=${encodeURIComponent(filter)}`;
  }

  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": JOB_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status}`);
  }

  return res.json();
}

/**
 * 全ブログを取得（ページネーション対応）
 * @param limit 取得件数（デフォルト: 10）
 * @param offset 取得開始位置（デフォルト: 0）
 * @returns BlogsResponse
 */
export async function getAllBlogs(
  limit: number = 10,
  offset: number = 0
): Promise<BlogsResponse> {
  try {
    // まず既存のgetLatestBlogs関数を使って動作確認
    if (offset === 0) {
      try {
        const latestBlogs = await getLatestBlogs(limit);
        console.log('Successfully fetched blogs using getLatestBlogs');
        return latestBlogs;
      } catch (error) {
        console.warn('getLatestBlogs failed, trying direct API call:', error);
      }
    }

    const url = `${BASE_URL}/blogs?limit=${limit}&offset=${offset}&orders=-publishedAt`;
    console.log('Fetching from URL:', url);

    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`API returned ${res.status} for URL: ${url}`);
      throw new Error(`Failed to fetch all blogs: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('getAllBlogs failed:', error);
    // フォールバック: 空のレスポンスを返す
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }
}

/**
 * ロゴ一覧を取得
 * @param limit 取得件数（デフォルト: 20）
 * @returns LogosResponse
 */
export async function getLogos(limit: number = 20): Promise<LogosResponse> {
  // 環境変数の検証
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.error('MicroCMS environment variables are not properly configured');
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }

  try {
    const url = `${BASE_URL}/logo?limit=${limit}&orders=-publishedAt`;
    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Logos API Error Response:', errorText);
      throw new Error(`Failed to fetch logos: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Logos Network or parsing error:', error);
    return {
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: limit
    };
  }
}

/**
 * スラッグで単一ブログ記事を取得
 * @param slug 記事のスラッグ
 * @returns Blog | null
 */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  // 環境変数の検証
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.error('MicroCMS environment variables are not properly configured');
    return null;
  }

  try {
    const filters = encodeURIComponent(`slug[equals]${slug}`);
    // 同一slugが複数存在する場合（旧移行の重複レコード等）は最新の改訂を優先し、公開版へ解決する
    const url = `${BASE_URL}/blogs?filters=${filters}&limit=1&orders=-revisedAt`;
    console.log('Fetching blog by slug from URL:', url);

    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    console.log('Blog by slug response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Blog by slug API Error Response:', errorText);
      throw new Error(`Failed to fetch blog by slug: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    const blogs = data.contents || [];
    
    if (blogs.length === 0) {
      console.log(`No blog found with slug: ${slug}`);
      return null;
    }

    return blogs[0];
  } catch (error) {
    console.error('Blog by slug Network or parsing error:', error);
    return null;
  }
}

/**
 * IDで単一ブログ記事を取得
 * @param id 記事のID
 * @returns Blog | null
 */
export async function getBlogById(id: string, draftKey?: string): Promise<Blog | null> {
  // 環境変数の検証
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.error('MicroCMS environment variables are not properly configured');
    return null;
  }

  try {
    const url = `${BASE_URL}/blogs/${id}${draftKey ? `?draftKey=${encodeURIComponent(draftKey)}` : ''}`;
    console.log('Fetching blog by ID from URL:', url);

    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      cache: "no-store",
    });

    console.log('Blog by ID response status:', res.status);

    if (!res.ok) {
      if (res.status === 404) {
        console.log(`Blog not found with ID: ${id}`);
        return null;
      }
      const errorText = await res.text();
      console.error('Blog by ID API Error Response:', errorText);
      throw new Error(`Failed to fetch blog by ID: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Blog by ID Network or parsing error:', error);
    return null;
  }
}
