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

  test("3. Response body of login and refresh never exposes refresh_token, and document.cookie / localStorage never expose it", async ({ page }) => {
    let loginBodyHasRefreshToken = false;
    let refreshBodyHasRefreshToken = false;

    await page.route("**/api/v1/auth/login", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json?.data && "refresh_token" in json.data) {
        loginBodyHasRefreshToken = true;
      }
      await route.fulfill({ response });
    });

    await page.route("**/api/v1/auth/refresh", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json?.data && "refresh_token" in json.data) {
        refreshBodyHasRefreshToken = true;
      }
      await route.fulfill({ response });
    });

    // Login
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[type="email"]', "patient@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|patient)/, { timeout: 10000 });

    // Assert login response body never contained refresh_token
    expect(loginBodyHasRefreshToken).toBe(false);

    // Assert document.cookie never exposes refresh_token (it is httpOnly)
    const clientCookies = await page.evaluate(() => document.cookie);
    expect(clientCookies).not.toContain("refresh_token");

    // Assert localStorage never exposes refresh_token or access_token
    const localRefreshToken = await page.evaluate(() => localStorage.getItem("refresh_token"));
    const localAccessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(localRefreshToken).toBeNull();
    expect(localAccessToken).toBeNull();

    // Trigger page reload which invokes /auth/refresh
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/(dashboard|patient)/);

    // Assert refresh response body never contained refresh_token
    expect(refreshBodyHasRefreshToken).toBe(false);
  });

  test("4. Malicious script scenario: fetch() with X-Client-Type: non-browser cannot exfiltrate refresh token in response body", async ({ page }) => {
    // 1. Authenticate user to obtain session and httpOnly cookie
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[type="email"]', "patient@arogyavajra.com");
    await page.fill('input[type="password"]', SEED_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|patient)/, { timeout: 10000 });

    // 2. Simulate malicious in-page XSS script executing fetch with X-Client-Type: non-browser and credentials: include
    const exfilResult = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Client-Type": "non-browser",
            "X-Auth-Flow": "token-body",
          },
          credentials: "include",
          body: JSON.stringify({}),
        });
        const data = await res.json();
        return {
          status: res.status,
          hasRefreshToken: Boolean(data?.data && "refresh_token" in data.data),
          data,
        };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    });

    // 3. Must succeed or return valid refresh, but MUST NEVER expose refresh_token in response body
    expect(exfilResult.hasRefreshToken).toBe(false);
    expect(exfilResult.data?.data?.refresh_token).toBeUndefined();
  });
});
