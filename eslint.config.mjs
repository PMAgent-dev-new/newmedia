// eslint-config-next 16 はフラット設定をそのまま export する。以前の FlatCompat 経由の読み込みは
// "Converting circular structure to JSON" で落ち、lint が一度も走っていなかった（jobmadley と同じ形に揃える）
import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextConfig,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
];

export default eslintConfig;
