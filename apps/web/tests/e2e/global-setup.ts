import { chromium, type FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SEED_PASSWORD = "ArogyaVajra@2026!";
const ROLES = [
  { role: "admin", email: "admin@arogyavajra.com", expectedUrl: /\/(dashboard|admin)/ },
  { role: "doctor", email: "doctor@arogyavajra.com", expectedUrl: /\/(dashboard|doctor)/ },
  { role: "receptionist", email: "receptionist@arogyavajra.com", expectedUrl: /\/(dashboard|receptionist)/ },
  { role: "billing", email: "billing@arogyavajra.com", expectedUrl: /\/(dashboard|billing)/ },
  { role: "patient", email: "patient@arogyavajra.com", expectedUrl: /\/(dashboard|patient)/ },
];

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    config.projects[0]?.use?.baseURL ||
    process.env.BASE_URL ||
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    "http://localhost:3000";

  const authDir = path.resolve(__dirname, ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    for (const { role, email, expectedUrl } of ROLES) {
      const page = await browser.newPage({ baseURL });
      try {
        await page.goto("/login");
        await page.waitForLoadState("domcontentloaded");
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', SEED_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(expectedUrl, { timeout: 15000 });
        await page.context().storageState({ path: path.join(authDir, `${role}.json`) });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
