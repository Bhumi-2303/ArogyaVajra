#!/usr/bin/env node
/**
 * Automated verification suite for ArogyaVajra frontend security headers and CSP.
 * Verifies both development and production configurations.
 */

import assert from "node:assert";

console.log("============================================================");
console.log("   Arogyavajra Security Headers & CSP Verification Suite    ");
console.log("============================================================\n");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}: ${err.message}`);
    failed++;
  }
}

async function loadConfigForEnv(nodeEnv, extraEnv = {}) {
  // Clear require cache or use dynamic import with query to bypass ESM module cache
  const originalEnv = { ...process.env };
  process.env.NODE_ENV = nodeEnv;
  for (const [k, v] of Object.entries(extraEnv)) {
    process.env[k] = v;
  }

  const moduleUrl = `../next.config.mjs?cacheBust=${Date.now()}_${Math.random()}`;
  const imported = await import(moduleUrl);
  const nextConfig = imported.default;
  const headerConfigs = await nextConfig.headers();

  // Restore env
  process.env = originalEnv;

  const catchAllRule = headerConfigs.find((r) => r.source === "/(.*)");
  assert(catchAllRule, "Expected catch-all rule with source /(.*)");

  const headersMap = new Map();
  for (const h of catchAllRule.headers) {
    headersMap.set(h.key.toLowerCase(), h.value);
  }
  return headersMap;
}

async function run() {
  // --- Section 1: Production Environment Verification ---
  console.log("[1/3] Verifying Production Configuration (NODE_ENV=production)...");
  const prodHeaders = await loadConfigForEnv("production", {
    NEXT_PUBLIC_API_URL: "https://api.arogyavajra.com/api/v1",
  });

  test("Prod: Content-Security-Policy header is configured", () => {
    assert(prodHeaders.has("content-security-policy"), "Missing CSP header");
  });

  const prodCsp = prodHeaders.get("content-security-policy") || "";

  test("Prod CSP: enforces default-src 'self'", () => {
    assert(prodCsp.includes("default-src 'self'"));
  });

  test("Prod CSP: script-src enforces 'self' without unsafe-eval or wildcards", () => {
    assert(prodCsp.includes("script-src 'self'"));
    assert(!prodCsp.includes("'unsafe-eval'"), "Must not include unsafe-eval in scripts");
    assert(!prodCsp.includes("script-src *"), "Must not include wildcard in script-src");
  });

  test("Prod CSP: script-src permits 'unsafe-inline' for Next.js App Router RSC hydration scripts", () => {
    const scriptDirective = prodCsp.split(";").find((d) => d.trim().startsWith("script-src")) || "";
    assert(scriptDirective.includes("'unsafe-inline'"), "Must permit 'unsafe-inline' in script-src for Next.js App Router streaming hydration scripts");
  });

  test("Prod CSP: connect-src does NOT permit insecure localhost:8000", () => {
    assert(!prodCsp.includes("http://localhost:8000"), "Production must not allow localhost in connect-src");
    assert(!prodCsp.includes("http://127.0.0.1:8000"), "Production must not allow 127.0.0.1 in connect-src");
  });

  test("Prod CSP: connect-src does NOT use blanket 'https:' wildcard", () => {
    const connectDirective = prodCsp.split(";").find((d) => d.trim().startsWith("connect-src")) || "";
    const tokens = connectDirective.trim().split(/\s+/);
    assert(!tokens.includes("https:"), "connect-src must not contain open 'https:' wildcard");
  });

  test("Prod CSP: connect-src includes secure API origin", () => {
    assert(prodCsp.includes("https://api.arogyavajra.com"));
  });

  test("Prod CSP: prevents framing with frame-ancestors 'none'", () => {
    assert(prodCsp.includes("frame-ancestors 'none'"));
  });

  test("Prod CSP: restricts object-src to 'none'", () => {
    assert(prodCsp.includes("object-src 'none'"));
  });

  test("Prod: Strict-Transport-Security (HSTS) is enabled with 1-year max-age", () => {
    const hsts = prodHeaders.get("strict-transport-security") || "";
    assert(hsts.includes("max-age=31536000"));
    assert(hsts.includes("includeSubDomains"));
  });

  test("Prod: HSTS does NOT preload by default without verification", () => {
    const hsts = prodHeaders.get("strict-transport-security") || "";
    assert(!hsts.includes("preload"), "Preload should not be forced without explicit opt-in");
  });

  // Test explicit preload opt-in
  const prodPreloadHeaders = await loadConfigForEnv("production", {
    ENABLE_HSTS_PRELOAD: "true",
  });
  test("Prod: HSTS adds preload when ENABLE_HSTS_PRELOAD=true", () => {
    const hsts = prodPreloadHeaders.get("strict-transport-security") || "";
    assert(hsts.includes("preload"));
  });

  // --- Section 2: Development Environment Verification ---
  console.log("\n[2/3] Verifying Development Configuration (NODE_ENV=development)...");
  const devHeaders = await loadConfigForEnv("development");
  const devCsp = devHeaders.get("content-security-policy") || "";

  test("Dev CSP: connect-src permits local API development (localhost:8000)", () => {
    assert(devCsp.includes("http://localhost:8000"));
  });

  test("Dev CSP: script-src permits unsafe-eval and unsafe-inline for dev hydration", () => {
    assert(devCsp.includes("'unsafe-eval'"));
    assert(devCsp.includes("'unsafe-inline'"));
  });

  test("Dev: Strict-Transport-Security is NOT served over local HTTP development", () => {
    assert(!devHeaders.has("strict-transport-security"), "HSTS must not be served in development HTTP");
  });

  // --- Section 3: Shared Security Headers Verification ---
  console.log("\n[3/3] Verifying Baseline Hardening Headers...");
  test("X-Frame-Options is set to DENY", () => {
    assert.strictEqual(prodHeaders.get("x-frame-options"), "DENY");
  });

  test("X-Content-Type-Options is set to nosniff", () => {
    assert.strictEqual(prodHeaders.get("x-content-type-options"), "nosniff");
  });

  test("Referrer-Policy is set to strict-origin-when-cross-origin", () => {
    assert.strictEqual(prodHeaders.get("referrer-policy"), "strict-origin-when-cross-origin");
  });

  test("Permissions-Policy restricts sensitive device APIs", () => {
    const pp = prodHeaders.get("permissions-policy") || "";
    assert(pp.includes("camera=()"));
    assert(pp.includes("microphone=()"));
    assert(pp.includes("geolocation=()"));
  });

  console.log("\n------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
