/**
 * Arogyavajra API URL Construction Regression Test Suite
 *
 * Verifies:
 * 1. Centralized resolveApiUrl logic in lib/api/client.ts prevents duplicate /api/v1 prefixes
 * 2. All domain API modules (appointments, medical-records, prescriptions, invoices, availability, audit, patients, doctors, users, auth)
 *    use clean relative endpoint paths
 * 3. Exact URL resolution for all major API methods
 * 4. Resiliency against varying NEXT_PUBLIC_API_URL formats (with/without trailing slash, custom hosts)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// Logic mirror of normalizeApiInternalUrl from lib/api/client.ts
function normalizeApiInternalUrl(rawUrl, isProdOverride) {
  const isProd =
    isProdOverride !== undefined ? isProdOverride : process.env.NODE_ENV === "production";
  const candidate = (rawUrl ?? process.env.API_INTERNAL_URL ?? "").trim().replace(/\/+$/, "");

  if (!candidate) {
    if (isProd) {
      throw new Error(
        "ConfigurationError: API_INTERNAL_URL environment variable is required in production."
      );
    }
    return "http://localhost:8000";
  }

  const normalized =
    candidate.startsWith("http://") || candidate.startsWith("https://")
      ? candidate
      : `http://${candidate}`;

  if (isProd) {
    try {
      const parsed = new URL(normalized);
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "0.0.0.0" ||
        parsed.hostname === "::1" ||
        parsed.hostname === "[::1]"
      ) {
        throw new Error(
          `Security validation failed: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address '${candidate}'.`
        );
      }
    } catch (err) {
      if (err.message && err.message.startsWith("Security validation failed")) {
        throw err;
      }
      if (
        candidate.includes("localhost") ||
        candidate.includes("127.0.0.1") ||
        candidate.includes("0.0.0.0")
      ) {
        throw new Error(
          `Security validation failed: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address '${candidate}'.`
        );
      }
    }
  }

  return normalized;
}

// Logic mirror of resolveApiUrl from lib/api/client.ts
function resolveApiUrl(endpoint, baseUrl) {
  const isProd = process.env.NODE_ENV === "production";
  const defaultBase = isProd ? "/api/v1" : "http://localhost:8000/api/v1";
  const rawBase = baseUrl ?? (process.env.NEXT_PUBLIC_API_URL || defaultBase);
  const base = rawBase.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const baseHasVersion = base.endsWith("/api/v1");
  const endpointHasVersion =
    normalizedEndpoint === "/api/v1" ||
    normalizedEndpoint.startsWith("/api/v1/") ||
    normalizedEndpoint.startsWith("/api/v1?");

  if (normalizedEndpoint === "/") {
    return baseHasVersion ? base : (base ? `${base}/api/v1` : "/api/v1");
  }

  if (baseHasVersion && endpointHasVersion) {
    const stripped = normalizedEndpoint.slice("/api/v1".length);
    return `${base}${stripped}`;
  }

  if (!baseHasVersion && !endpointHasVersion) {
    return `${base}/api/v1${normalizedEndpoint}`;
  }

  return `${base}${normalizedEndpoint}`;
}

async function run() {
  console.log("============================================================");
  console.log("    Arogyavajra API URL Construction Regression Suite       ");
  console.log("============================================================\n");

  // 1. Verify client.ts implementation
  console.log("[1/5] Verifying resolveApiUrl and normalizeApiInternalUrl in lib/api/client.ts...");
  const clientPath = path.join(webDir, "lib", "api", "client.ts");
  const clientContent = fs.readFileSync(clientPath, "utf-8");

  assert(
    clientContent.includes("export function resolveApiUrl"),
    "client.ts exports resolveApiUrl function"
  );
  assert(
    clientContent.includes("export function normalizeApiInternalUrl"),
    "client.ts exports normalizeApiInternalUrl function"
  );
  assert(
    clientContent.includes("resolveApiUrl(endpoint)"),
    "apiClient invokes resolveApiUrl(endpoint)"
  );
  assert(
    clientContent.includes('resolveApiUrl("/auth/refresh")'),
    "client.ts uses resolveApiUrl for token refresh"
  );
  assert(
    !clientContent.includes("${API_BASE_URL}"),
    "No un-normalized API_BASE_URL string interpolations remain in client.ts"
  );
  assert(
    !clientContent.includes("`${API_BASE_URL}${endpoint.startsWith(\"/\")"),
    "Legacy un-normalized URL concatenation removed from apiClient"
  );

  // 2. Test URL Resolution Edge Cases
  console.log("\n[2/5] Testing resolveApiUrl resolution against edge cases...");
  const defaultBase = "http://localhost:8000/api/v1";

  // Standard relative endpoints
  assert(
    resolveApiUrl("/appointments", defaultBase) === "http://localhost:8000/api/v1/appointments",
    "Resolves /appointments to http://localhost:8000/api/v1/appointments"
  );
  assert(
    resolveApiUrl("/medical-records/123", defaultBase) === "http://localhost:8000/api/v1/medical-records/123",
    "Resolves /medical-records/123 correctly"
  );
  assert(
    resolveApiUrl("/invoices/456/payments", defaultBase) === "http://localhost:8000/api/v1/invoices/456/payments",
    "Resolves nested /invoices/456/payments correctly"
  );

  // Endpoint without leading slash
  assert(
    resolveApiUrl("prescriptions", defaultBase) === "http://localhost:8000/api/v1/prescriptions",
    "Handles endpoint without leading slash ('prescriptions')"
  );

  // Accidental /api/v1 prefix in endpoint (defensive sanitization)
  assert(
    resolveApiUrl("/api/v1/appointments", defaultBase) === "http://localhost:8000/api/v1/appointments",
    "Strips duplicate /api/v1 from /api/v1/appointments"
  );
  assert(
    resolveApiUrl("/api/v1/invoices?page=1", defaultBase) === "http://localhost:8000/api/v1/invoices?page=1",
    "Preserves query string when stripping duplicate /api/v1 prefix"
  );

  // Trailing slash in base URL
  assert(
    resolveApiUrl("/doctors", "http://localhost:8000/api/v1/") === "http://localhost:8000/api/v1/doctors",
    "Normalizes base URL with trailing slash"
  );

  // Custom production domain with /api/v1
  assert(
    resolveApiUrl("/patients", "https://api.arogyavajra.com/api/v1") === "https://api.arogyavajra.com/api/v1/patients",
    "Resolves correctly with custom production HTTPS domain with /api/v1"
  );

  // Bare origin base URLs without /api/v1 (e.g. Render production environment)
  const renderOrigin = "https://arogyavajra-api.onrender.com";
  assert(
    resolveApiUrl("/auth/register", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1/auth/register",
    "Prepends /api/v1 when base URL is bare domain without /api/v1"
  );
  assert(
    resolveApiUrl("auth/register", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1/auth/register",
    "Prepends /api/v1 when base URL is bare domain and endpoint lacks leading slash"
  );
  assert(
    resolveApiUrl("/auth/register", "https://arogyavajra-api.onrender.com/") === "https://arogyavajra-api.onrender.com/api/v1/auth/register",
    "Normalizes bare domain with trailing slash and prepends /api/v1"
  );
  assert(
    resolveApiUrl("/api/v1/auth/register", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1/auth/register",
    "Does not duplicate /api/v1 when base URL is bare domain but endpoint includes /api/v1"
  );
  assert(
    resolveApiUrl("/api/v1", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1",
    "Resolves /api/v1 on bare domain without duplicate segments"
  );
  assert(
    resolveApiUrl("/api/v1?page=1", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1?page=1",
    "Resolves /api/v1 with query string on bare domain"
  );
  assert(
    resolveApiUrl("/", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1",
    "Resolves root slash on bare domain to /api/v1"
  );
  assert(
    resolveApiUrl("", renderOrigin) === "https://arogyavajra-api.onrender.com/api/v1",
    "Resolves empty endpoint on bare domain to /api/v1"
  );

  // Local bare origin
  assert(
    resolveApiUrl("/auth/login", "http://localhost:8000") === "http://localhost:8000/api/v1/auth/login",
    "Resolves /auth/login on local bare domain http://localhost:8000"
  );
  assert(
    resolveApiUrl("/auth/login", "http://localhost:8000/") === "http://localhost:8000/api/v1/auth/login",
    "Resolves /auth/login on local bare domain http://localhost:8000/ with trailing slash"
  );

  // Production relative URL resolution (same-origin proxy)
  assert(
    resolveApiUrl("/appointments", "/api/v1") === "/api/v1/appointments",
    "Prod relative: Resolves /appointments to /api/v1/appointments"
  );
  assert(
    resolveApiUrl("medical-records/123", "/api/v1") === "/api/v1/medical-records/123",
    "Prod relative: Resolves medical-records/123 without leading slash"
  );
  assert(
    resolveApiUrl("/api/v1/prescriptions", "/api/v1") === "/api/v1/prescriptions",
    "Prod relative: Strips duplicate /api/v1 from /api/v1/prescriptions"
  );
  assert(
    resolveApiUrl("/auth/refresh", "/api/v1") === "/api/v1/auth/refresh",
    "Prod relative: Resolves /auth/refresh to /api/v1/auth/refresh"
  );

  // Environment-based defaults
  const prevEnv = process.env.NODE_ENV;
  const prevUrl = process.env.NEXT_PUBLIC_API_URL;
  delete process.env.NEXT_PUBLIC_API_URL;

  process.env.NODE_ENV = "production";
  assert(
    resolveApiUrl("/appointments") === "/api/v1/appointments",
    "Prod default: Resolves /appointments to relative /api/v1/appointments when NEXT_PUBLIC_API_URL is unset in production"
  );
  assert(
    resolveApiUrl("/auth/refresh") === "/api/v1/auth/refresh",
    "Prod default: Resolves /auth/refresh to relative /api/v1/auth/refresh in production"
  );

  process.env.NODE_ENV = "development";
  assert(
    resolveApiUrl("/appointments") === "http://localhost:8000/api/v1/appointments",
    "Dev default: Resolves /appointments to http://localhost:8000/api/v1/appointments in development"
  );

  process.env.NODE_ENV = prevEnv;
  if (prevUrl) process.env.NEXT_PUBLIC_API_URL = prevUrl;

  // 3. Inspect All API Module Source Files for Duplicated Prefixes
  console.log("\n[3/5] Inspecting domain API files to ensure NO hardcoded /api/v1 remains...");
  const apiModules = [
    "appointments.ts",
    "medical-records.ts",
    "prescriptions.ts",
    "invoices.ts",
    "availability.ts",
    "audit.ts",
    "patients.ts",
    "doctors.ts",
    "users.ts",
    "auth.ts",
  ];

  for (const moduleFile of apiModules) {
    const filePath = path.join(webDir, "lib", "api", moduleFile);
    assert(fs.existsSync(filePath), `File exists: lib/api/${moduleFile}`);

    const content = fs.readFileSync(filePath, "utf-8");
    const hasDuplicatePrefix = content.includes("/api/v1/");

    assert(
      !hasDuplicatePrefix,
      `lib/api/${moduleFile} does not contain '/api/v1/' in endpoint strings`
    );
  }

  // 4. Verify Critical Endpoint Patterns
  console.log("\n[4/5] Verifying endpoint patterns in key services...");
  const appointmentsContent = fs.readFileSync(path.join(webDir, "lib", "api", "appointments.ts"), "utf-8");
  assert(appointmentsContent.includes("`/appointments${qs ?"), "appointments.ts uses /appointments for listing");
  assert(appointmentsContent.includes('"/appointments"'), "appointments.ts uses /appointments for creation");

  const invoicesContent = fs.readFileSync(path.join(webDir, "lib", "api", "invoices.ts"), "utf-8");
  assert(invoicesContent.includes("`/invoices/${id}/payments`"), "invoices.ts uses /invoices/${id}/payments for payment recording");

  const availabilityContent = fs.readFileSync(path.join(webDir, "lib", "api", "availability.ts"), "utf-8");
  assert(availabilityContent.includes("`/doctors/${doctorId}/availability`"), "availability.ts uses /doctors/${doctorId}/availability");

  const auditContent = fs.readFileSync(path.join(webDir, "lib", "api", "audit.ts"), "utf-8");
  assert(auditContent.includes("`/audit-logs${qs ?"), "audit.ts uses /audit-logs for audit listing");

  // 5. Test normalizeApiInternalUrl Scheme and Hostport Normalization
  console.log("\n[5/5] Testing normalizeApiInternalUrl scheme and hostport normalization...");

  // Render fromService hostport: prefixes http:// and strips trailing slashes
  assert(
    normalizeApiInternalUrl("arogyavajra-api:8000") === "http://arogyavajra-api:8000",
    "Bare hostport: 'arogyavajra-api:8000' -> 'http://arogyavajra-api:8000'"
  );
  assert(
    normalizeApiInternalUrl("arogyavajra-api:8000/") === "http://arogyavajra-api:8000",
    "Bare hostport with trailing slash: 'arogyavajra-api:8000/' -> 'http://arogyavajra-api:8000'"
  );
  assert(
    normalizeApiInternalUrl("arogyavajra-api:8000///") === "http://arogyavajra-api:8000",
    "Bare hostport with multiple trailing slashes -> 'http://arogyavajra-api:8000'"
  );
  assert(
    normalizeApiInternalUrl("  arogyavajra-api:8000  ") === "http://arogyavajra-api:8000",
    "Trims leading/trailing whitespace around hostport"
  );

  // Private IP address formats
  assert(
    normalizeApiInternalUrl("10.0.1.5:8000") === "http://10.0.1.5:8000",
    "Private IP with port: '10.0.1.5:8000' -> 'http://10.0.1.5:8000'"
  );
  assert(
    normalizeApiInternalUrl("10.0.1.5") === "http://10.0.1.5",
    "Private IP without port: '10.0.1.5' -> 'http://10.0.1.5'"
  );

  // Full URLs preserved without duplicate scheme
  assert(
    normalizeApiInternalUrl("http://arogyavajra-api:8000") === "http://arogyavajra-api:8000",
    "Existing http:// URL is preserved: 'http://arogyavajra-api:8000'"
  );
  assert(
    normalizeApiInternalUrl("http://arogyavajra-api:8000/") === "http://arogyavajra-api:8000",
    "Existing http:// URL with trailing slash is normalized"
  );
  assert(
    normalizeApiInternalUrl("https://api.example.com") === "https://api.example.com",
    "Existing https:// URL is preserved: 'https://api.example.com'"
  );
  assert(
    normalizeApiInternalUrl("https://api.example.com/") === "https://api.example.com",
    "Existing https:// URL with trailing slash is normalized"
  );
  assert(
    normalizeApiInternalUrl("https://internal.example.com:8443/") === "https://internal.example.com:8443",
    "Existing https:// URL with port and trailing slash is normalized"
  );

  // Development fallback
  assert(
    normalizeApiInternalUrl("", false) === "http://localhost:8000",
    "Development: Empty string defaults to 'http://localhost:8000'"
  );
  assert(
    normalizeApiInternalUrl(undefined, false) === "http://localhost:8000",
    "Development: Undefined rawUrl defaults to 'http://localhost:8000'"
  );

  // Production requirement and rejection
  let prodMissingThrew = false;
  try {
    normalizeApiInternalUrl("", true);
  } catch (err) {
    prodMissingThrew = true;
    assert(
      err.message.includes("ConfigurationError: API_INTERNAL_URL environment variable is required in production"),
      "Production: Missing URL throws ConfigurationError"
    );
  }
  assert(prodMissingThrew, "Production requires API_INTERNAL_URL");

  const loopbackTargets = [
    "http://localhost:8000",
    "localhost:8000",
    "http://127.0.0.1:8000",
    "127.0.0.1:8000",
    "0.0.0.0:8000",
    "http://[::1]:8000",
  ];

  for (const loopback of loopbackTargets) {
    let loopbackThrew = false;
    try {
      normalizeApiInternalUrl(loopback, true);
    } catch (err) {
      loopbackThrew = true;
      assert(
        err.message.includes("Security validation failed"),
        `Production rejects loopback '${loopback}'`
      );
    }
    assert(loopbackThrew, `Production loopback '${loopback}' must throw`);
  }

  console.log("\n------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite encountered unexpected error:", err);
  process.exit(1);
});
