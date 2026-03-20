import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/features/current-reading/tests',
  testMatch: /.*\.e2e\.ts$/,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});

