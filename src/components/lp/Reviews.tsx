'use client';

import { useState } from 'react';

/**
 * ご利用者のクチコミ（Google）。
 * 株式会社PM Agent（ライドジョブ運営）に寄せられた実際のGoogleクチコミを手動掲載。
 * ※すべて星5の投稿。本文のない投稿・ネガティブ投稿は除外しています。
 */

// 株式会社PM Agent のGoogleマップ掲載（CID指定の正規URL）
const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps?cid=6988897874728835669';

type Review = { name: string; time: string; localGuide?: boolean; text: string };

const REVIEWS: Review[] = [
  { name: '力谷真名実', time: '1か月前', text: '担当の矢野さんがとても親身にサポートしてくださり、面接前の面談でも気遣いのある言葉がけのおかげで不安がかなり軽くなりました。LINEでも気軽に相談でき、レスポンスも早く安心してやり取りができました。面接対策も具体的で分かりやすく、自信を持って本番に臨めました。無事に採用いただけたのもサポートのおかげだと思っています。本当にありがとうございました！' },
  { name: '大西克彦', time: '2か月前', text: '転職活動で苦戦の中、最大の敵であるネガティブ思考からの転換により、最後は複数社内定へと導いて頂きました。転活サポートのみならず、人生の大事な転換点として「助言・伴走」頂いた事は、自身の大きな自信になりました。感謝ことしきり、有難うございました。' },
  { name: 'Hiếu- ヒエウ', time: '3週間前', text: '転職を考えていたので、この会社を知ることができて本当に良かったです。担当者はとても熱心で献身的な方です。私が適切な仕事を見つけるのを手伝ってくれたり、面接のサポートや必要な書類の準備をしてくれました。今ではとても良い仕事に出会えました。この会社にとても感謝しています。' },
  { name: 'GreenPea Little', time: '1年前', text: '自力で探しても中々見つからない中、とても良いタクシー会社を紹介して頂きました。ありがとうございます！' },
  { name: 'カズヨシ', time: '1か月前', localGuide: true, text: '他にも当たってましたがタイミング合わず、今回担当S様が親身になっていただき乗務決まりました。ありがとうございました。' },
  { name: 'シェルパン', time: '2か月前', text: '今回就職に際し連絡し、担当さんと密に連絡を取り合い無事に入社する事が出来ました。電話やメールでのやり取りでしたが、コチラの不安なども親身になって聴いてくださり、最後まで安心して就職活動が出来ました。' },
  { name: 'tez s', time: '2か月前', text: '担当してくれた方がとても親身に相談に乗ってくださり、転職時の不安がかなり楽になりました。履歴書や職務経歴書の作成、面接時のアドバイスなどの相談にも応じてくれて本当に助かりました。' },
  { name: 'Cream tropical plants', time: '4か月前', text: '転職活動中、不安な気持ちが大きかったのですが、担当の方が常に寄り添って話を聞いてくださり、とても安心できました。対応も丁寧で、こちらの立場に立って考えてくださっているのが伝わってきました。感謝の気持ちでいっぱいです。' },
  { name: 'Takahashi Y', time: '4か月前', text: 'こちらの紹介で転職しました。広い視野で紹介頂き、丁寧に対応頂いています。また、転職後もフォロー頂けるのが助かります。今後も、よろしくお願いいたします。' },
  { name: 'S 1214', time: '4か月前', text: '色々とサポートしていただいたおかげで、希望の仕事に就くことができました。面接についても対策していただき、大変助かりました。ありがとうございました。' },
  { name: 'アイカ', time: '4か月前', text: 'この度、エージェント様を通して入社させていただきました。その節は大変お世話になりました。また、今現在も入社して間もない私に対しても優しく対応していただいております。' },
  { name: 'なーさん', time: '4か月前', text: '丁寧に相談に乗っていただき、無事に就職することができました。就職するにあたって、アドバイスもいただくこともできて参考になりました😊' },
  { name: 'ころん&ペコ', time: '4か月前', text: '担当の方が親身になって相談に乗ってくださり、就職する事が出来ました。ありがとうございます。' },
  { name: '木野谷参代', time: '1年前', text: 'お世話になってだいぶん助けてもらいました。初めての経験する事ばっかりで、知恵を借してくれる事で、つまずいて失敗する事も転ばぬ先の杖になってもらいました。これから、教習所に向かいます。ありがとうございました。' },
  { name: 'Co No', time: '1年前', localGuide: true, text: '仕事を探していた際に相談に乗っていただきました。非常に丁寧に寄り添っていただきました。無事、仕事が決まりました！こちらにお願いしてよかったです。ありがとうございます！' },
  { name: 'Hideki Amemiya', time: '1年前', text: 'いつも私のことを気にかけてくださり、本当にありがたいです。大変お世話になっており、感謝しています。' },
  { name: 'にもさん', time: '7か月前', text: '親切・丁寧に説明等していただき感謝しております。ありがとうございました。' },
  { name: 'Eiichi Kusano', time: '7か月前', text: 'とても丁寧に対応いただき感謝しています。' },
  { name: '嘉郎久保', time: '4週間前', text: '最後まで親切にフォローして頂きありがとうございました。' },
  { name: 'アリオ', time: '1週間前', text: 'いつも優しく丁寧な対応がとても好印象でした。面接に際してのアドバイスも的確で、おかげさまで応募した会社から内定を頂くことができました。' },
];

const INITIAL = 3;

function Stars() {
  return (
    <div className="flex gap-0.5 text-[#fbbc04] text-sm leading-none" aria-label="星5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 002 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function LpReviews() {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? REVIEWS : REVIEWS.slice(0, INITIAL);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="text-[#0a6bb3] font-extrabold tracking-eyebrow text-xs mb-4">REVIEWS</div>
          <h2 className="text-[#0a6bb3] text-2xl md:text-4xl font-extrabold tracking-[0.06em]">
            ご利用者のクチコミ
          </h2>
          <p className="inline-flex items-center gap-2 text-[#5a6175] mt-5 font-semibold text-sm md:text-base">
            <GoogleG />
            Googleに寄せられた、ご利用者様のリアルな声です。
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {list.map((r) => (
            <article
              key={r.name + r.time}
              className="mb-6 break-inside-avoid rounded-2xl bg-white border border-[#e6eef9] p-6 shadow-[0_2px_8px_rgba(16,24,40,0.04)]"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(r.name)}&backgroundColor=eaf3ff,e6eef9,f3f9ff&radius=50`}
                  alt=""
                  loading="lazy"
                  className="w-10 h-10 rounded-full bg-[#f3f9ff] object-cover shrink-0 border border-[#e6eef9]"
                />
                <div className="min-w-0">
                  <div className="text-[#0b2a44] font-bold text-sm truncate">{r.name}</div>
                  <div className="text-[#6a7282] text-xs font-medium">
                    {r.localGuide ? 'ローカルガイド・' : ''}{r.time}
                  </div>
                </div>
                <span className="ml-auto shrink-0"><GoogleG /></span>
              </div>
              <Stars />
              <p className="mt-3 text-[#5a6175] text-sm font-medium">{r.text}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mt-10">
          {!showAll && REVIEWS.length > INITIAL && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#0a6bb3] text-[#0a6bb3] font-extrabold px-9 py-3.5 text-sm transition-colors hover:bg-[#0a6bb3] hover:text-white"
            >
              クチコミをもっと見る（全{REVIEWS.length}件）
            </button>
          )}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0a6bb3] font-bold text-sm hover:underline"
          >
            <GoogleG />
            Googleですべてのクチコミを見る
          </a>
        </div>
      </div>
    </section>
  );
}
