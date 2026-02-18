import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
  },
  webServer: {
    command:
      "VITE_E2E_BYPASS_AUTH=true VITE_E2E_DISABLE_REDIRECT=true VITE_E2E_TEST_EMAIL=ada@example.com VITE_CLOUDINARY_CLOUD_NAME=test VITE_CLOUDINARY_UPLOAD_PRESET=test VITE_SUPABASE_URL=https://supabase.test VITE_SUPABASE_ANON_KEY=test npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
