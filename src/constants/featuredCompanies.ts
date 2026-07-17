export interface FeaturedCompanyDestination {
  slug: string;
  name: string;
}

/**
 * microCMSのロゴIDを求人サイト側の常設企業ハブへ対応付ける。
 * company フィールドが未入力のロゴでも、正しいaltとクロール可能なリンクを出すためIDを正とする。
 */
export const FEATURED_COMPANY_BY_LOGO_ID: Record<string, FeaturedCompanyDestination> = {
  "f8coyx7-ua": { slug: "mk-taxi", name: "MKタクシー" },
  "pjpqde_5nj": { slug: "yashima-jidosha", name: "八洲自動車" },
  "3bqq-pafa": { slug: "daiichi-kotsu", name: "第一交通" },
  "hhsehiqg6chs": { slug: "heiwa-kotsu", name: "平和交通" },
  "0q91e47hq": { slug: "kawasaki-taxi", name: "川崎タクシー" },
  "i3iqm_9jgb": { slug: "om-taxi", name: "OMタクシー" },
  "95g84_3h7_8n": { slug: "nihon-kotsu", name: "日本交通" },
  "2puj4qzrmv37": { slug: "kawasaki-kotsu", name: "川崎交通" },
  "9s724c2imfil": { slug: "milight-taxi", name: "未来都" },
  "jzhwihacwbw": { slug: "nikko-jidosha", name: "日興自動車" },
  "xc9ni56q-zn": { slug: "emitas-taxi", name: "エミタスタクシー" },
};

export const companyJobsUrl = (slug: string) => `https://ridejob.jp/companies/${slug}`;

