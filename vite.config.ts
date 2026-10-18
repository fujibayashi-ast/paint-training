import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// iPad の実機確認用。mkcert の証明書が .cert/ にあるときだけ HTTPS にする（手順: docs/ipad-dev.md）
const certFile = ".cert/dev.pem";
const keyFile = ".cert/dev-key.pem";
const https =
  existsSync(certFile) && existsSync(keyFile)
    ? { cert: readFileSync(certFile), key: readFileSync(keyFile) }
    : undefined;
// <Mac の名前>.local で開けるようにする（既定では IP と localhost しか通らない）
const allowedHosts = [".local"];

export default defineConfig({
  server: { https, allowedHosts },
  preview: { https, allowedHosts },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "イラスト練習（仮）",
        short_name: "お絵かき練習",
        description: "イラストを描けるようになるための練習アプリ",
        lang: "ja",
        display: "standalone",
        theme_color: "#18181b",
        background_color: "#ffffff",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
