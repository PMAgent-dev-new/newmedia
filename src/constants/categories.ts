/**
 * microCMSカテゴリID定数
 * 各カテゴリのコンテンツIDをここで管理
 */
export const CATEGORY_IDS = {
  /** ピックアップカテゴリ */
  PICKUP: 'rqk2lr41z',
  /** 企業取材カテゴリ */
  COMPANY_INTERVIEW: '2',
} as const;

/**
 * カテゴリID型
 */
export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS];

/**
 * カテゴリID → 一覧URLのslug。microCMSのcategories APIのslugと一致させること。
 *
 * ヘッダーやトップのカテゴリカードは環境変数を使わない固定データで描くため、
 * CMSを引かずに正しいURLを組み立てられるようここに持つ。未知のIDはIDのまま返し、
 * /blog/category/[category] 側がslug URLへ301で寄せる。
 */
const CATEGORY_SLUGS: Record<string, string> = {
  '1': 'mobility-trend',
  '2': 'company-interview',
  '3': 'user-voice',
  '4': 'tips',
  '5': 'interview',
};

/** カテゴリ別一覧のパス（basePath /media は含めない）。 */
export function categoryPathById(id: string): string {
  return `/blog/category/${CATEGORY_SLUGS[id] || id}`;
}
