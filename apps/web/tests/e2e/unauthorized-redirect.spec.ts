import { test, expect } from "@playwright/test";

test.describe("Unauthorized Route Redirects", () => {
  const protectedRoutes = [
    "/dashboard",
    "/appointments",
    "/medical-records",
    "/prescriptions",
    "/invoices",
    "/admin",
    "/audit-logs",
    "/profile",
    "/availability",
  ];

  for (const route of protectedRoutes) {
    test(`unauthenticated user navigating to ${route} is redirected to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?redirect=${encodeURIComponent(route)}`));
    });
  }

  const publicRoutes = [
    "/",
    "/features",
    "/how-it-works",
    "/about",
    "/privacy",
    "/terms",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  for (const route of publicRoutes) {
    test(`public route ${route} is accessible without authentication`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toContain(route === "/" ? "" : route);
    });
  }
});
