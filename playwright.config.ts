import { defineConfig } from '@playwright/test';

// Declare process for TS without relying on @types/node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

// Avoid __dirname in ESM/TS by computing CWD via process.cwd()
const cwd = process.cwd();

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'yarn dev',
    cwd,
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
