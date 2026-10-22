import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The end-to-end tests build into their own folder so they never overwrite the normal build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    globalNotFound: true,
    // Hostinger's build sandbox blocks Turbopack's loader child processes,
    // which breaks the Tailwind loader. Worker threads run in-process.
    turbopackPluginRuntimeStrategy: "workerThreads",
      serverActions: {
        
      // Blog posts with long markdown bodies are saved through server actions.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Admin-uploaded images are served by the /uploads route handler.
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/brand/**" },
      { pathname: "/uploads/**" },
    ],
    qualities: [70, 80],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
