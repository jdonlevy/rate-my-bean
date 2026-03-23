// @ts-check
const { defineConfig } = require("@playwright/test");

const PORT = process.env.PORT || 3000;
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
const useRemote = Boolean(process.env.E2E_BASE_URL);

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: useRemote
    ? undefined
    : {
        command: "PLAYWRIGHT=true npm run dev -- --hostname 127.0.0.1 --port 3000",
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
