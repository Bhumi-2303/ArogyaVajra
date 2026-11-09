import { test, expect } from "@playwright/test";

const SEED_PASSWORD = "ArogyaVajra@2026!";

test.describe("Critical MVP Journeys", () => {
  test("1. Patient registers and logs in", async ({ page }) => {
    const uniqueEmail = `patient_e2e_${Date.now()}@example.com`;

    // Registration
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 10000 });
  });

  test("2. Receptionist logs in and views appointments", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "receptionist@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|receptionist)/, { timeout: 10000 });
    await page.goto("/appointments");
    await expect(page.locator("h1")).toContainText("Appointments");
  });

  test("3. Doctor logs in, views clinical records and prescriptions", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "doctor@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|doctor)/, { timeout: 10000 });

    // Doctor checks medical records list
    await page.goto("/medical-records");
    await expect(page.locator("h1")).toContainText("Medical Records");

    // Doctor checks prescriptions list
    await page.goto("/prescriptions");
    await expect(page.locator("h1")).toContainText("Prescriptions");
  });

  test("4. Billing staff logs in and views invoices", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "billing@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|billing)/, { timeout: 10000 });

    await page.goto("/invoices");
    await expect(page.locator("h1")).toContainText("Invoices");
  });

  test("5. Administrator views audit logs", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(dashboard|admin)/, { timeout: 10000 });

    await page.goto("/audit-logs");
    await expect(page.locator("h1")).toContainText("Audit");
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });
});
