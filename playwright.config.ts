import { defineConfig } from "@playwright/test";

const PORT = 3200;

/**
 * End-to-end tests: `npm run test:e2e`. Builds and starts the site with its own data folder (.e2e-data,
 * recreated from seed/ on every run) and build folder, so real data and the normal build are never touched.
 * Uses the installed Google Chrome, so no browser download is needed.
 */
export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, channel: "chrome", trace: "retain-on-failure" },
  webServer: {
    command: `node node_modules/next/dist/bin/next build && node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      DATA_DIR: ".e2e-data",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "e2e-test-password",
      SESSION_SECRET: "e2e-session-secret-0123456789abcdef0123456789",
      INSECURE_COOKIES: "true",
      SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
