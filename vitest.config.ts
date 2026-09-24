import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/app/**/*.test.ts"],
    // src/lib/*.test.ts は node:test で書かれた別系統（`node --test` 用）。
    // vitest からは「テストが無いファイル」に見えて落ちるので対象外にする。
    // 移行するなら別PRで。ここで混ぜると、退避の配線の検証が
    // 既存テストの移植失敗に巻き込まれる。
    exclude: ["node_modules/**", "src/lib/**"],
  },
});
