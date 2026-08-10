// @ts-check
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    AstroPWA({
      registerType: "prompt",
      manifest: {
        name: "Timer",
        short_name: "Timer",
        description: "Track tasks, workouts or run pomodoros.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0b0b0c",
        theme_color: "#0b0b0c",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{css,html,ico,js,png,svg,webmanifest}"],
      },
    }),
  ],
});
