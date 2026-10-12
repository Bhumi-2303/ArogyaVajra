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

// Logic mirror of resolveApiUrl from lib/api/client.ts
function resolveApiUrl(endpoint, baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") {
  const base = baseUrl.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (
    base.endsWith("/api/v1") &&
    (normalizedEndpoint === "/api/v1" ||
      normalizedEndpoint.startsWith("/api/v1/") ||
      normalizedEndpoint.startsWith("/api/v1?"))
  ) {
    const stripped = normalizedEndpoint.slice("/api/v1".length);
    return `${base}${stripped}`;
  }

  return `${base}${normalizedEndpoint}`;
}

async function run() {
  console.log("============================================================");
  console.log("    Arogyavajra API URL Construction Regression Suite       ");
  console.log("============================================================\n");

  // 1. Verify client.ts implementation
  console.log("[1/4] Verifying resolveApiUrl implementation in lib/api/client.ts...");
  const clientPath = path.join(webDir, "lib", "api", "client.ts");
  const clientContent = fs.readFileSync(clientPath, "utf-8");

  assert(
    clientContent.includes("export function resolveApiUrl"),
    "client.ts exports resolveApiUrl function"
  );
  assert(
    clientContent.includes("resolveApiUrl(endpoint)"),
    "apiClient invokes resolveApiUrl(endpoint)"
  );
  assert(
    !clientContent.includes("`${API_BASE_URL}${endpoint.startsWith(\"/\")"),
    "Legacy un-normalized URL concatenation removed from apiClient"
  );

  // 2. Test URL Resolution Edge Cases
  console.log("\n[2/4] Testing resolveApiUrl resolution against edge cases...");
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

  // Custom production domain
  assert(
    resolveApiUrl("/patients", "https://api.arogyavajra.com/api/v1") === "https://api.arogyavajra.com/api/v1/patients",
    "Resolves correctly with custom production HTTPS domain"
  );

  // 3. Inspect All API Module Source Files for Duplicated Prefixes
  console.log("\n[3/4] Inspecting domain API files to ensure NO hardcoded /api/v1 remains...");
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
  console.log("\n[4/4] Verifying endpoint patterns in key services...");
  const appointmentsContent = fs.readFileSync(path.join(webDir, "lib", "api", "appointments.ts"), "utf-8");
  assert(appointmentsContent.includes("`/appointments${qs ?"), "appointments.ts uses /appointments for listing");
  assert(appointmentsContent.includes('"/appointments"'), "appointments.ts uses /appointments for creation");

  const invoicesContent = fs.readFileSync(path.join(webDir, "lib", "api", "invoices.ts"), "utf-8");
  assert(invoicesContent.includes("`/invoices/${id}/payments`"), "invoices.ts uses /invoices/${id}/payments for payment recording");

  const availabilityContent = fs.readFileSync(path.join(webDir, "lib", "api", "availability.ts"), "utf-8");
  assert(availabilityContent.includes("`/doctors/${doctorId}/availability`"), "availability.ts uses /doctors/${doctorId}/availability");

  const auditContent = fs.readFileSync(path.join(webDir, "lib", "api", "audit.ts"), "utf-8");
  assert(auditContent.includes("`/audit-logs${qs ?"), "audit.ts uses /audit-logs for audit listing");

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
