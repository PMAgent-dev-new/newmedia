import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/media',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
      // 「動画で見る」一覧のサムネイル（YouTubeの静的サムネイル）
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    // 画像最適化の設定
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1年キャッシュ
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/media',
        permanent: false,
        basePath: false,
      },
      {
        source: '/contact',
        destination: '/media/contact',
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
