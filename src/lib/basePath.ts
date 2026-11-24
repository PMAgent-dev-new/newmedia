export const BASE_PATH = '/media';

// クライアント/サーバの両方で使える basePath 付与ヘルパー
export function withBasePath(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // 既に basePath が付与されている場合は重複させない
  if (path.startsWith(BASE_PATH + '/')) return path;
  if (path.startsWith('/')) return `${BASE_PATH}${path}`;
  return `${BASE_PATH}/${path}`;
}

// CSS 背景や unoptimized 画像は Next.js の画像ローダーを経由しない。
export function publicImageUrl(path: string): string {
  const local = withBasePath(path);
  if (!local.startsWith(BASE_PATH + '/') || !process.env.NEXT_PUBLIC_IMAGE_ASSET_PREFIX) return local;
  return process.env.NEXT_PUBLIC_IMAGE_ASSET_PREFIX + local.slice(BASE_PATH.length);
}
