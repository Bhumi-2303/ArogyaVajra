import { test, expect } from "@playwright/test";

test.describe("Authentication Session & Silent Refresh", () => {
  const SEED_PASSWORD = "ArogyaVajra@2026!";

  test("1. Login persists across page reload via silent refresh with first-party cookie", async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[type="email"]', "patient@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for successful login redirect
    await expect(page).toHaveURL(/\/(dashboard|patient)/, { timeout: 10000 });

    // Reload the page: in-memory token is cleared, but silent refresh recovers the session using the httpOnly cookie
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Session must survive page reload without being redirected back to /login
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/(dashboard|patient)/);
  });

  test("2. Expired access token is silently refreshed and request recovers seamlessly", async ({ page }) => {
    let refreshCount = 0;
    // Intercept refresh requests to observe refresh invocations
    await page.route("**/api/v1/auth/refresh", async (route) => {
      refreshCount++;
      await route.continue();
    });

    // Login as patient
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[type="email"]', "patient@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|patient)/, { timeout: 10000 });

    // Simulate an expired access token on appointments API endpoint:
    // First request returns 401 TOKEN_EXPIRED, subsequent request succeeds
    let returned401 = false;
    await page.route("**/api/v1/appointments*", async (route) => {
      if (!returned401) {
        returned401 = true;
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "TOKEN_EXPIRED",
              message: "The access token has expired.",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const initialRefreshCount = refreshCount;

    // Navigate to appointments
    await page.goto("/appointments");
    await page.waitForLoadState("domcontentloaded");

    // apiClient catches the 401, executes silent refresh to acquire fresh token, and retries the request
    expect(refreshCount).toBeGreaterThan(initialRefreshCount);
    await expect(page.locator("h1")).toContainText("Appointments");
  });
});
