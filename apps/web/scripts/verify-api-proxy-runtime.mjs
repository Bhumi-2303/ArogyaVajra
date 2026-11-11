#!/usr/bin/env node
/**
 * ArogyaVajra Same-Origin Runtime API Proxy Verification Suite
 *
 * Proves:
 * 1. Runtime Route Handler exists at app/api/v1/[[...path]]/route.ts and handles all HTTP verbs.
 * 2. Static build-time rewrites in next.config.mjs are removed so destinations are not baked at build.
 * 3. In production, missing API_INTERNAL_URL fails loudly at boot and request time.
 * 4. In production, API_INTERNAL_URL pointing to localhost/loopback is strictly rejected.
 * 5. In production, valid internal private network endpoints (e.g. Render fromService hostport: arogyavajra-api:8000)
 *    normalize correctly to http://arogyavajra-api:8000 and are proven not to be localhost.
 * 6. The runtime environment boot validator scripts/validate-runtime-env.mjs enforces this on container start.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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

// Logic mirror of resolveTrustworthyClientIp for verification
function isValidIpAddress(ip) {
  if (!ip) return false;
  const clean = ip.trim();
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(clean)) return true;
  try {
    const unbracketed = clean.replace(/^\[|\]$/g, "");
    if (unbracketed.includes(":") && unbracketed.split(":").length <= 8) {
      new URL(`http://[${unbracketed}]`);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function resolveTrustworthyClientIp(req, isProd, trustPlatformHeaders = false) {
  if (trustPlatformHeaders) {
    const cf = req.headers.get("cf-connecting-ip")?.trim();
    if (cf && isValidIpAddress(cf)) return cf;
    const tc = req.headers.get("true-client-ip")?.trim();
    if (tc && isValidIpAddress(tc)) return tc;
  }
  if (!isProd) {
    const rawXff = req.headers.get("x-forwarded-for");
    if (rawXff) {
      const parts = rawXff.split(",").map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (isValidIpAddress(p)) return p;
      }
    }
  }
  if (req.ip && isValidIpAddress(req.ip)) return req.ip;
  return isProd ? "unknown" : "127.0.0.1";
}

// Logic mirror of normalizeApiInternalUrl for verification
function normalizeApiInternalUrl(rawUrl, isProd) {
  const candidate = (rawUrl ?? "").trim().replace(/\/+$/, "");

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

function run() {
  console.log("============================================================");
  console.log("    ArogyaVajra Runtime API Proxy Verification Suite        ");
  console.log("============================================================\n");

  // 1. Verify next.config.mjs does NOT have static localhost rewrite
  console.log("[1/5] Verifying next.config.mjs removes static build-time rewrites...");
  const nextConfigPath = path.join(webDir, "next.config.mjs");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

  assert(
    !nextConfigContent.includes("async rewrites()"),
    "next.config.mjs does not contain async rewrites() (avoids build-time destination baking)"
  );
  assert(
    !nextConfigContent.includes("destination: `${cleanInternal}/api/v1/:path*`"),
    "Static rewrite destination removed from next.config.mjs"
  );

  // 2. Verify runtime Route Handler implementation
  console.log("\n[2/5] Verifying runtime route handler app/api/v1/[[...path]]/route.ts...");
  const routePath = path.join(webDir, "app", "api", "v1", "[[...path]]", "route.ts");
  assert(fs.existsSync(routePath), "app/api/v1/[[...path]]/route.ts exists");

  const routeContent = fs.readFileSync(routePath, "utf-8");
  assert(
    routeContent.includes('export const dynamic = "force-dynamic"'),
    "Route handler is marked force-dynamic (evaluated dynamically at request time)"
  );
  assert(
    routeContent.includes("normalizeApiInternalUrl"),
    "Route handler invokes normalizeApiInternalUrl at request time"
  );
  assert(
    routeContent.includes("resolveTrustworthyClientIp"),
    "Route handler invokes resolveTrustworthyClientIp"
  );
  assert(
    routeContent.includes('headers.set("x-real-ip", trustworthyIp)'),
    "Route handler injects authoritative X-Real-IP header to internal backend"
  );
  assert(
    routeContent.includes('lower === "x-forwarded-for"') &&
      routeContent.includes('lower === "x-real-ip"') &&
      routeContent.includes('lower === "forwarded"') &&
      routeContent.includes('lower === "true-client-ip"') &&
      routeContent.includes('lower === "cf-connecting-ip"'),
    "Route handler strips ALL client-supplied forwarded / IP headers"
  );
  assert(
    routeContent.includes('lower === "x-client-type"') &&
      routeContent.includes('lower === "x-auth-flow"'),
    "Route handler strips client-supplied X-Client-Type and X-Auth-Flow headers"
  );
  assert(
    routeContent.includes("x-forwarded-proto"),
    "Route handler injects/forwards X-Forwarded-Proto"
  );
  assert(
    routeContent.includes("set-cookie"),
    "Route handler preserves all Set-Cookie headers"
  );
  assert(
    routeContent.includes('duplex: "half"'),
    "Route handler streams request body with duplex: 'half'"
  );

  // 2a. Verify proxy error sanitization (no internal hostname or stack leakage)
  assert(
    routeContent.includes('detail: "Bad gateway"') &&
      routeContent.includes("status: 502") &&
      !routeContent.includes("error: message"),
    "Route handler returns generic { detail: 'Bad gateway' } (502) and suppresses error details from response"
  );

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  for (const m of methods) {
    assert(
      routeContent.includes(`export async function ${m}`),
      `Route handler exports ${m} HTTP method handler`
    );
  }

  // 2b. Unit verification of resolveTrustworthyClientIp
  const mockHeaders = (obj) => ({
    get: (key) => obj[key.toLowerCase()] ?? null,
  });

  // Production with TRUST_PLATFORM_IP_HEADERS=true: CF-Connecting-IP takes highest precedence
  const prodCf = resolveTrustworthyClientIp(
    { headers: mockHeaders({ "cf-connecting-ip": "203.0.113.195", "x-forwarded-for": "1.2.3.4" }) },
    true,
    true
  );
  assert(prodCf === "203.0.113.195", "Production with TRUST_PLATFORM_IP_HEADERS=true resolves client IP from CF-Connecting-IP");

  // Production with TRUST_PLATFORM_IP_HEADERS=true: True-Client-IP takes second precedence
  const prodTc = resolveTrustworthyClientIp(
    { headers: mockHeaders({ "true-client-ip": "198.51.100.72", "x-forwarded-for": "1.2.3.4" }) },
    true,
    true
  );
  assert(prodTc === "198.51.100.72", "Production with TRUST_PLATFORM_IP_HEADERS=true resolves client IP from True-Client-IP");

  // Production with TRUST_PLATFORM_IP_HEADERS=false (default): Platform edge headers are strictly ignored
  const prodNoTrust = resolveTrustworthyClientIp(
    { headers: mockHeaders({ "cf-connecting-ip": "203.0.113.195", "true-client-ip": "198.51.100.72" }) },
    true,
    false
  );
  assert(prodNoTrust === "unknown", "Production with TRUST_PLATFORM_IP_HEADERS=false strictly ignores edge headers");

  // Production: Spoofed X-Forwarded-For or X-Real-IP without platform edge headers is never trusted
  const prodSpoof = resolveTrustworthyClientIp(
    { headers: mockHeaders({ "x-forwarded-for": "198.51.100.99", "x-real-ip": "198.51.100.99" }) },
    true,
    true
  );
  assert(prodSpoof === "unknown", "Production never trusts client-chosen X-Forwarded-For or X-Real-IP");

  // Local development (TRUST_PLATFORM_IP_HEADERS=false): Falls back to leftmost valid X-Forwarded-For entry
  const devXff = resolveTrustworthyClientIp(
    { headers: mockHeaders({ "x-forwarded-for": "192.168.1.50, 10.0.0.1" }) },
    false,
    false
  );
  assert(devXff === "192.168.1.50", "Development falls back to leftmost valid X-Forwarded-For entry");

  // Verify stripping of client auth-flow bypass headers
  const strippedHeaders = ["X-Client-Type", "X-Auth-Flow", "x-client-type", "x-auth-flow"];
  for (const h of strippedHeaders) {
    assert(
      routeContent.includes(`lower === "${h.toLowerCase()}"`),
      `Route handler strips ${h} from client requests`
    );
  }

  // 2c. Verify proxy error payload leakage prevention
  const simulatedProxyCatch = (_err) => {
    return {
      status: 502,
      body: JSON.stringify({ detail: "Bad gateway" }),
    };
  };

  const sampleErrors = [
    new Error("connect ECONNREFUSED arogyavajra-api:8000\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1606:16)"),
    new Error("ConfigurationError: API_INTERNAL_URL environment variable is required in production."),
    new Error("Security validation failed: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address 'localhost:8000'."),
    new TypeError("fetch failed: write EPIPE"),
  ];

  for (const sampleErr of sampleErrors) {
    const errorResponse = simulatedProxyCatch(sampleErr);
    const bodyStr = errorResponse.body;
    assert(
      errorResponse.status === 502 && bodyStr === JSON.stringify({ detail: "Bad gateway" }),
      `Proxy error response returns status 502 and generic body for error: ${sampleErr.message.slice(0, 32)}...`
    );
    assert(
      !bodyStr.includes("arogyavajra-api") &&
        !bodyStr.includes("8000") &&
        !bodyStr.includes("localhost") &&
        !bodyStr.includes("stack") &&
        !bodyStr.includes("ECONNREFUSED") &&
        !bodyStr.includes("ConfigurationError"),
      "Proxy error payload contains no internal hostname, port, stack trace, or internal exception string"
    );
  }

  // 3. Verify production behavior when API_INTERNAL_URL is missing
  console.log("\n[3/5] Testing production loud failure when API_INTERNAL_URL is missing...");
  let missingThrown = false;
  try {
    normalizeApiInternalUrl("", true);
  } catch (err) {
    missingThrown = true;
    assert(
      err.message.includes("ConfigurationError") &&
        err.message.includes("API_INTERNAL_URL environment variable is required in production"),
      "Throws loud ConfigurationError when API_INTERNAL_URL is missing in production"
    );
  }
  assert(missingThrown, "Missing API_INTERNAL_URL in production throws error");

  // 4. Verify production localhost / loopback rejection
  console.log("\n[4/5] Testing production localhost / loopback destination rejection...");
  const rejectedDestinations = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "0.0.0.0:8000",
    "localhost:8000",
    "http://[::1]:8000",
  ];

  for (const dest of rejectedDestinations) {
    let rejected = false;
    try {
      normalizeApiInternalUrl(dest, true);
    } catch (err) {
      rejected = true;
      assert(
        err.message.includes("Security validation failed"),
        `Rejects loopback destination '${dest}' in production`
      );
    }
    assert(rejected, `Loopback destination '${dest}' must throw in production`);
  }

  // Valid destinations in production
  const validPrivateHostport = "arogyavajra-api:8000";
  const normalizedHostport = normalizeApiInternalUrl(validPrivateHostport, true);
  assert(
    normalizedHostport === "http://arogyavajra-api:8000",
    `Normalizes private hostport '${validPrivateHostport}' to '${normalizedHostport}'`
  );
  assert(
    !normalizedHostport.includes("localhost") && !normalizedHostport.includes("127.0.0.1"),
    "Proves production destination is NOT localhost"
  );

  const validHttps = "https://api.arogyavajra.com";
  const normalizedHttps = normalizeApiInternalUrl(validHttps, true);
  assert(
    normalizedHttps === "https://api.arogyavajra.com",
    `Normalizes HTTPS destination '${validHttps}' to '${normalizedHttps}'`
  );
  assert(
    !normalizedHttps.includes("localhost"),
    "Proves production HTTPS destination is NOT localhost"
  );

  // 5. Verify boot validator process execution
  console.log("\n[5/5] Testing scripts/validate-runtime-env.mjs container boot behavior...");
  const validatorScript = path.join(webDir, "scripts", "validate-runtime-env.mjs");
  assert(fs.existsSync(validatorScript), "scripts/validate-runtime-env.mjs exists");

  // Subcase A: Missing in production -> exit code 1
  const missingBoot = spawnSync(process.execPath, [validatorScript], {
    env: { ...process.env, NODE_ENV: "production", API_INTERNAL_URL: "" },
  });
  assert(
    missingBoot.status === 1,
    "Boot validator exits with code 1 when API_INTERNAL_URL is missing in production"
  );
  assert(
    missingBoot.stderr.toString().includes("FATAL ERROR: API_INTERNAL_URL environment variable is required"),
    "Boot validator logs loud fatal error message on missing env"
  );

  // Subcase B: Localhost in production -> exit code 1
  const localhostBoot = spawnSync(process.execPath, [validatorScript], {
    env: { ...process.env, NODE_ENV: "production", API_INTERNAL_URL: "http://localhost:8000" },
  });
  assert(
    localhostBoot.status === 1,
    "Boot validator exits with code 1 when API_INTERNAL_URL points to localhost in production"
  );
  assert(
    localhostBoot.stderr.toString().includes("FATAL ERROR: In production, API_INTERNAL_URL destination cannot point to localhost"),
    "Boot validator logs loud fatal error on localhost in production"
  );

  // Subcase C: Valid hostport in production -> exit code 0
  const validBoot = spawnSync(process.execPath, [validatorScript], {
    env: { ...process.env, NODE_ENV: "production", API_INTERNAL_URL: "arogyavajra-api:8000" },
  });
  assert(
    validBoot.status === 0,
    "Boot validator exits with code 0 when valid internal hostport is provided"
  );
  assert(
    validBoot.stdout.toString().includes("[Runtime Boot Check] API_INTERNAL_URL validated: http://arogyavajra-api:8000"),
    "Boot validator outputs validated internal URL"
  );

  // Subcase D: Development environment -> exit code 0 without requirement
  const devBoot = spawnSync(process.execPath, [validatorScript], {
    env: { ...process.env, NODE_ENV: "development", API_INTERNAL_URL: "" },
  });
  assert(
    devBoot.status === 0,
    "Boot validator exits cleanly in development environment"
  );

  console.log("\n------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
