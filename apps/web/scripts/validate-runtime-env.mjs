#!/usr/bin/env node
/**
 * Production Runtime Environment Validator
 *
 * Runs before `next start` on container boot to ensure required production environment
 * variables are configured securely and fail fast if invalid.
 */

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const rawUrl = (process.env.API_INTERNAL_URL || "").trim().replace(/\/+$/, "");

  if (!rawUrl) {
    console.error("\n==================================================================");
    console.error("FATAL ERROR: API_INTERNAL_URL environment variable is required in production.");
    console.error("The same-origin API proxy requires API_INTERNAL_URL to route traffic");
    console.error("to the backend service (e.g. 'arogyavajra-api:8000' or internal URL).");
    console.error("==================================================================\n");
    process.exit(1);
  }

  const normalized =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `http://${rawUrl}`;

  try {
    const parsed = new URL(normalized);
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0" ||
      parsed.hostname === "::1" ||
      parsed.hostname === "[::1]"
    ) {
      console.error("\n==================================================================");
      console.error(`FATAL ERROR: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address '${rawUrl}'.`);
      console.error("The production web service cannot proxy to localhost inside a container.");
      console.error("==================================================================\n");
      process.exit(1);
    }
  } catch (err) {
    if (
      rawUrl.includes("localhost") ||
      rawUrl.includes("127.0.0.1") ||
      rawUrl.includes("0.0.0.0")
    ) {
      console.error(`\nFATAL ERROR: API_INTERNAL_URL cannot point to localhost: ${rawUrl}\n`);
      process.exit(1);
    }
  }

  console.log(`[Runtime Boot Check] API_INTERNAL_URL validated: ${normalized}`);
}
