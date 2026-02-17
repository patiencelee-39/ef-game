import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    // 產出到 dist/ 再複製（Vite 不允許 outDir 為根目錄）
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/firebase-init.js"),
      output: {
        // 單一檔案輸出
        entryFileNames: "firebase-bundle.js",
        // 不產生 chunk
        manualChunks: undefined,
        // IIFE 格式 — 不需要 import/export
        format: "iife",
      },
    },
    // 最小化
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    sourcemap: false,
  },
});
