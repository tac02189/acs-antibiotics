import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Firebase Hosting serves from the domain root. There is no GitHub Pages
// target for this project, so the base is simply "/".
export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      // autoUpdate, not "prompt": a dosing reference must never pin a reader to a
      // superseded guideline waiting for them to click "reload". This builds the
      // service worker with skipWaiting + clientsClaim. The generated register
      // call only registers, so the already-rendered page would keep running the
      // bundle it loaded — src/main.jsx reloads on the next controller change to
      // close that gap. The two are a pair; do not remove one without the other.
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeManifestIcons: false,
      manifest: {
        name: "ACS Antibiotic Guide — MU Health Acute Care Surgery",
        short_name: "ACS Abx",
        description:
          "Bedside reference for the MU Health Acute Care Surgery Antibiotic Practice Management Guideline (December 2025).",
        theme_color: "#121317",
        background_color: "#121317",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the shell, the self-hosted fonts and the source PDF, so the
        // guideline (and its PDF) opens offline from the first install.
        // (The plugin adds manifest.webmanifest to the precache itself; listing
        // the extension here produced a duplicate entry.)
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,pdf}"],
        // og-image is only fetched by link unfurlers, which do not run service workers.
        globIgnores: ["og-image.png"],
        // The PDF is ~860 KB; this is comfortably above the 2 MiB default so that
        // a modest growth in the PDF or bundle fails loudly only when it matters.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "index.html",
        // Requests that are plainly files (anything with a dot before the query)
        // and the hashed asset directory must never be answered with the shell:
        // Workbox tests this list against pathname + search, so the pattern is
        // "a literal dot anywhere before the query", not an end-anchored extension.
        navigateFallbackDenylist: [/\/assets\//, /^[^?]*\./],
        // The PDF's filename carries its content hash (src/data/pmg.js
        // source.file), so no cache-busting query is needed and none is ignored
        // beyond Workbox's defaults.
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
      },
      // A service worker in dev makes HMR behave like app bugs. Build + preview to test it.
      devOptions: { enabled: false },
    }),
  ],
});
