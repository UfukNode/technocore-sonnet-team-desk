"use strict";

const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5191",
    browserName: "chromium",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:5191/api/health",
    reuseExistingServer: true,
    timeout: 15000,
  },
});
