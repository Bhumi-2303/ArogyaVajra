import { test, expect } from "@playwright/test";

test.describe("Critical MVP Journeys", () => {
  test("1. Patient registers and logs in", async ({ page }) => {
    const uniqueEmail = `patient_e2e_${Date.now()}@example.com`;

    // Registration
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[id="register-fullname"]', "Test Patient");
    await page.fill('input[id="register-age"]', "30");
    await page.fill('input[id="register-email"]', uniqueEmail);
    await page.fill('input[id="register-password"]', "SecurePassword123!");
    await page.fill('input[id="register-confirm-password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Should redirect to patient portal or login/dashboard
    await expect(page).toHaveURL(/\/(dashboard|login|patient)/, { timeout: 15000 });
  });

  test("2. Receptionist logs in and views appointments", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: "tests/e2e/.auth/receptionist.json",
    });
    const page = await context.newPage();
    try {
      await page.goto("/appointments");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toContainText("Appointments");
    } finally {
      await context.close();
    }
  });

  test("3. Doctor logs in, views clinical records and prescriptions", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: "tests/e2e/.auth/doctor.json",
    });
    const page = await context.newPage();
    try {
      await page.goto("/medical-records");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toContainText("Medical Records");

      await page.goto("/prescriptions");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toContainText("Prescriptions");
    } finally {
      await context.close();
    }
  });

  test("4. Billing staff logs in and views invoices", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: "tests/e2e/.auth/billing.json",
    });
    const page = await context.newPage();
    try {
      await page.goto("/invoices");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toContainText("Invoices");
    } finally {
      await context.close();
    }
  });

  test("5. Administrator views audit logs", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: "tests/e2e/.auth/admin.json",
    });
    const page = await context.newPage();
    try {
      await page.goto("/audit-logs");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toContainText("Audit");
      await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
    } finally {
      await context.close();
    }
  });
});
