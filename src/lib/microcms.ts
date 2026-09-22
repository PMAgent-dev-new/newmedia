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

/**
 * 一覧カード（BlogCard / PickupArticles）が使うフィールドだけ。
 *
 * ⚠️ これを省くと microCMS は**本文込みの全フィールド**を返す。実測 2026-09-23
 * （数値は記事の長さで変わるので、測った対象を必ず併記すること）:
 *   最新3件（カテゴリ指定なし）      88,000B → fields 指定で 1,904B
 *   最新6件（カテゴリ指定なし）     185,067B → fields 指定で 3,788B
 *   企業取材カテゴリ6件              98,815B（レビュー時の実測）
 * この2本と記事本文27KBを足した記事ページ1回ぶんが 294KB → 32KB（ページ全体で約89%減。
 * 98%減は一覧2本に対する比率で、記事本文は no-store のまま毎回27KB流れる）。
 * Hobbyプランはデータ転送量 20GB/月を超えると**APIが停止しサイトが表示できなくなる**
 * （2026-09-23 に「今月10GB到達」の通知が届いたのが発端）。
 * 本文が要る面（CompanyInterviewSection の抜粋）だけ fields を明示的に渡すこと。
 */
export const CARD_FIELDS = "id,title,slug,eyecatch,publishedAt,category";

/** 一覧系の再取得間隔。記事の公開は1日1〜2本なので1時間で足りる。 */
export const LIST_REVALIDATE = 3600;

/**
 * 広告LPが出す「最高給与の求人」の再取得間隔。
 * 掲載が終わった求人を好条件として出し続けないよう、一覧より短くする。
 */
export const TOP_SALARY_REVALIDATE = 900;

/**
 * 求人カード（NewJobSection / lp の Jobs）が使うフィールドだけ。
 *
 * ⚠️ blogs と同じ話で、fields を省くと募集要項の長文（descriptionWork / descriptionOther 等）
 * まで返る。実測 2026-09-23: 最新4件 39,489B → fields 指定で 5,845B（85%減）。
 * 求人CMS（MICROCMS_SERVICE_DOMAIN_2）はメディアとは別サービス＝別の転送量枠だが、
 * 上限（20GB/月）を超えるとAPIが止まるのは同じ。
 */
export const JOB_CARD_FIELDS =
  "id,jobName,title,companyName,employmentType,wageType,salaryMin,salaryMax,addressPrefMuni,municipality,tags,images";

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
export async function getLatestBlogs(
  limit: number = 6,
  fields: string = CARD_FIELDS
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

  console.log('Environment check:', {
    SERVICE_DOMAIN,
    API_KEY: API_KEY ? 'Set' : 'Not set',
    BASE_URL
  });

  const url = `${BASE_URL}/blogs?limit=${limit}&orders=-publishedAt&fields=${encodeURIComponent(fields)}`;
  console.log('Fetching from URL:', url);

  try {
    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      // 毎リクエスト取り直すと転送量が訪問数に比例する（上限20GB/月・超過でAPI停止）。
      // 一覧カードは1時間古くても実害がないのでキャッシュに載せる。
      next: { revalidate: LIST_REVALIDATE },
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
  limit: number = 6,
  fields: string = CARD_FIELDS
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
    const url = `${BASE_URL}/blogs?filters=${filters}&limit=${limit}&orders=-publishedAt&fields=${encodeURIComponent(fields)}`;
    console.log('Fetching category blogs from URL:', url);

    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY,
      },
      next: { revalidate: LIST_REVALIDATE },
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
    // member は年単位でしか変わらないのに訪問ごとに取り直していた。
    // microCMS のデータ転送量（20GB/月・超過でAPI停止）を訪問数に比例させない。
    next: { revalidate: LIST_REVALIDATE },
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
  const url = `${JOB_BASE_URL}/jobs?limit=${limit}&orders=-publishedAt&fields=${encodeURIComponent(JOB_CARD_FIELDS)}`;

  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": JOB_API_KEY,
    },
    // 求人の増減が1時間遅れて出ても実害は無い。訪問ごとの取得をやめて転送量を抑える。
    next: { revalidate: LIST_REVALIDATE },
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
  let url = `${JOB_BASE_URL}/jobs?limit=${limit}&orders=-salaryMax&fields=${encodeURIComponent(JOB_CARD_FIELDS)}`;
  if (categoryIds && categoryIds.length > 0) {
    const filter = categoryIds.map((id) => `jobCategory[equals]${id}`).join("[or]");
    url += `&filters=${encodeURIComponent(filter)}`;
  }

  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": JOB_API_KEY,
    },
    // 求人の増減が1時間遅れて出ても実害は無い。訪問ごとの取得をやめて転送量を抑える。
    next: { revalidate: TOP_SALARY_REVALIDATE },
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
/** @deprecated 呼び出し元なし。全件走査が要るなら `allBlogs.ts` の fetchAllBlogsCached を使う（no-store・fields無しで全文を取るため転送量が跳ねる）。 */
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
      // logo は年単位でしか変わらないのに訪問ごとに取り直していた。
      // microCMS のデータ転送量（20GB/月・超過でAPI停止）を訪問数に比例させない。
      next: { revalidate: LIST_REVALIDATE },
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
    // 同一slugが複数存在する場合（旧移行の重複レコード等）に、どのレコードへ解決するかを決める。
    // 並び順は allBlogs.ts の dedupeBySlug と**必ず同じ**にすること。ここだけ変えると、
    // 一覧カード（dedupeBySlug の勝者）と記事詳細（この問い合わせの勝者）が別レコードを指し、
    // 同じURLで見出し・日付・本文がちぐはぐになる。
    // 以前ここは -revisedAt だったため、旧レコードを1回公開し直すだけで詳細だけが旧本文へ
    // 切り替わる状態だった（実測 2026-09-02: 3組の重複が現存）。
    const url = `${BASE_URL}/blogs?filters=${filters}&limit=1&orders=-publishedAt,-revisedAt`;
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
