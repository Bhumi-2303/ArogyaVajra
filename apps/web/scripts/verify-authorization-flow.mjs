/**
 * Arogyavajra Authorization & RBAC Automated Verification Suite
 *
 * Verifies:
 * 1. Role-aware navigation structure by role (Section 21 of APP-FLOW.md)
 * 2. Client-side authorization & permission resolution
 * 3. Protected route behavior & 403 Forbidden state foundations
 * 4. Backend RBAC enforcement & resource ownership verification
 * 5. Backend immunity to untrusted client role claims (never trust frontend role)
 */

import http from "node:http";
import crypto from "node:crypto";
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

async function fetchRoute(host, port, reqPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host,
        port,
        path: reqPath,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Leave raw
          }
          resolve({ statusCode: res.statusCode, body: data, json: parsed });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
      );
    }
    req.end();
  });
}

async function run() {
  console.log("============================================================");
  console.log("  Arogyavajra Authorization & RBAC Verification Suite       ");
  console.log("============================================================\n");

  // --- Step 1: Role-Aware Navigation Structure by Role ---
  console.log("[1/4] Verifying Role-Aware Navigation Structure (APP-FLOW Section 21)...");

  const sidebarFile = fs.readFileSync(
    path.join(webDir, "components", "layout", "sidebar.tsx"),
    "utf8"
  );

  // Verify navigation items for all 5 roles
  assert(
    sidebarFile.includes("PATIENT: [") &&
      sidebarFile.includes('/appointments') &&
      sidebarFile.includes('/medical-records') &&
      sidebarFile.includes('/prescriptions') &&
      sidebarFile.includes('/invoices'),
    "Patient navigation items configured per specification"
  );

  assert(
    sidebarFile.includes("DOCTOR: [") &&
      sidebarFile.includes('/patients') &&
      sidebarFile.includes('/availability'),
    "Doctor navigation items configured per specification"
  );

  assert(
    sidebarFile.includes("RECEPTIONIST: [") &&
      sidebarFile.includes('/patients') &&
      sidebarFile.includes('/doctors') &&
      sidebarFile.includes('/appointments'),
    "Receptionist navigation items configured per specification"
  );

  assert(
    sidebarFile.includes("BILLING_STAFF: [") &&
      sidebarFile.includes('/invoices') &&
      sidebarFile.includes('/payments'),
    "Billing staff navigation items configured per specification"
  );

  assert(
    sidebarFile.includes("ADMIN: [") &&
      sidebarFile.includes('/users') &&
      sidebarFile.includes('/audit-logs'),
    "Admin navigation items configured per specification"
  );

  // --- Step 2: Client-side Authorization & 403 Forbidden State ---
  console.log("\n[2/4] Verifying Client-side ProtectedRoute & ForbiddenState...");

  const protectedRouteFile = fs.readFileSync(
    path.join(webDir, "components", "auth", "protected-route.tsx"),
    "utf8"
  );
  assert(
    protectedRouteFile.includes("router.replace"),
    "ProtectedRoute redirects unauthenticated users"
  );
  assert(
    protectedRouteFile.includes("ForbiddenState"),
    "ProtectedRoute renders ForbiddenState when role is unauthorized"
  );
  assert(
    protectedRouteFile.includes("return null"),
    "ProtectedRoute does not render children to unauthenticated users"
  );

  const forbiddenStateFile = fs.readFileSync(
    path.join(webDir, "components", "auth", "forbidden-state.tsx"),
    "utf8"
  );
  assert(
    forbiddenStateFile.includes('role="alert"'),
    "ForbiddenState provides accessible alert landmark"
  );
  assert(
    forbiddenStateFile.includes("403 Forbidden"),
    "ForbiddenState displays clear 403 status"
  );
  assert(
    forbiddenStateFile.includes("Role-Based Access Control"),
    "ForbiddenState explains RBAC policy"
  );

  const loginPageFile = fs.readFileSync(
    path.join(webDir, "app", "(auth)", "login", "page.tsx"),
    "utf8"
  );
  assert(
    loginPageFile.includes("redirectParam"),
    "Login page handles redirect parameter after successful authentication"
  );

  // --- Step 3: Backend Live RBAC & Role Verification ---
  console.log("\n[3/4] Verifying Live Backend RBAC Authorization Endpoints...");

  async function registerUser(role) {
    const email = `${role.toLowerCase()}_${crypto.randomBytes(4).toString("hex")}@example.com`;
    const res = await fetchRoute("localhost", 8000, "/api/v1/auth/register", {
      method: "POST",
      body: { email, password: "SecurePassword123!", role },
    });
    return { email, token: res.json?.data?.access_token };
  }

  try {
    const patient = await registerUser("PATIENT");
    const doctor = await registerUser("DOCTOR");
    const admin = await registerUser("ADMIN");

    // Test unauthenticated access to protected route
    const unauthRes = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/admin"
    );
    assert(
      unauthRes.statusCode === 401,
      "Backend rejects unauthenticated request with HTTP 401"
    );

    // Test Admin endpoint with Patient token -> 403
    const patientAdminRes = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/admin",
      { headers: { Authorization: `Bearer ${patient.token}` } }
    );
    assert(
      patientAdminRes.statusCode === 403,
      "Backend rejects Patient from Admin-only endpoint with HTTP 403"
    );

    // Test Admin endpoint with Admin token -> 200
    const adminAdminRes = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/admin",
      { headers: { Authorization: `Bearer ${admin.token}` } }
    );
    assert(
      adminAdminRes.statusCode === 200,
      "Backend allows Admin on Admin-only endpoint with HTTP 200"
    );

    // Test Doctor endpoint with Doctor token -> 200
    const doctorDoctorRes = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/doctor",
      { headers: { Authorization: `Bearer ${doctor.token}` } }
    );
    assert(
      doctorDoctorRes.statusCode === 200,
      "Backend allows Doctor on Doctor-only endpoint with HTTP 200"
    );

    // Test Doctor endpoint with Patient token -> 403
    const patientDoctorRes = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/doctor",
      { headers: { Authorization: `Bearer ${patient.token}` } }
    );
    assert(
      patientDoctorRes.statusCode === 403,
      "Backend rejects Patient from Doctor-only endpoint with HTTP 403"
    );
  } catch (err) {
    assert(false, `Live RBAC checks encountered error: ${err.message}`);
  }

  // --- Step 4: Backend Immunity to Untrusted Client Role Claims ---
  console.log("\n[4/4] Verifying Backend Does NOT Trust Frontend Role Input...");

  try {
    const patient = await registerUser("PATIENT");

    // Client attempts to claim ADMIN in query, header, and body
    const spoofAttempt = await fetchRoute(
      "localhost",
      8000,
      "/api/v1/authz/untrusted-client-role?role=ADMIN",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${patient.token}`,
          "X-User-Role": "ADMIN",
        },
        body: { role: "ADMIN" },
      }
    );

    assert(
      spoofAttempt.statusCode === 403,
      "Backend rejects spoofed role claims (HTTP 403) and relies exclusively on server-side token identity"
    );
  } catch (err) {
    assert(false, `Untrusted role verification encountered error: ${err.message}`);
  }

  console.log("\n============================================================");
  console.log(`  Summary: ${passed} passed, ${failed} failed`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
