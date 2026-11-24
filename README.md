This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### JS・CSS の Worker バイパス

Vercel の Production 環境に `ASSET_PREFIX=https://newmedia-eight.vercel.app/media` を設定して再ビルド・デプロイすると、Next.js の静的ファイル（JS・CSS・生成フォント等）を Vercel から直接配信します。既存の `basePath: '/media'` は維持し、ASSET_PREFIX にも `/media` を含めます。Development / Preview では未設定にします。

画像最適化、public 配下の画像、ページ、API の配信経路は変更しません。Cloudflare の既存ルートは維持します。反映後はブラウザの Network で `/media/_next/static/…` の配信先・HTTP 200・CORS・ページ遷移を確認してください。HTML と静的ファイルのデプロイが一致すること、更新前から開いている画面の遅延読み込みも確認します。

戻す場合は `ASSET_PREFIX` を削除して再ビルド・再デプロイします。

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
