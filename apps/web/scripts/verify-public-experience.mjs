/**
 * Arogyavajra Public Experience Automated Verification Suite
 *
 * Verifies:
 * 1. Public navigation & header links
 * 2. Public footer structure & legal links
 * 3. Responsive behavior & mobile drawer toggles
 * 4. Accessibility foundations (skip links, ARIA roles, semantic H1)
 * 5. Branding & favicon assets
 * 6. Live HTTP 200 status and rendered content across all public routes:
 *    - / (Public Landing Page)
 *    - /features (Features Page)
 *    - /how-it-works (How It Works Page)
 *    - /about (About Page)
 *    - /privacy (Privacy Policy)
 *    - /terms (Terms & Conditions)
 *    - /design-system (Design System Showcase)
 */

import http from "node:http";
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

async function fetchRoute(route) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:3000${route}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

async function run() {
  console.log("============================================================");
  console.log("  Arogyavajra Public Experience Verification Suite          ");
  console.log("============================================================\n");

  // 1. Branding & Favicon Verification
  console.log("[1/6] Verifying Branding & Favicon Assets...");
  const iconPath = path.join(webDir, "app/icon.svg");
  assert(fs.existsSync(iconPath), "app/icon.svg exists for favicon integration");
  const iconContent = fs.readFileSync(iconPath, "utf-8");
  assert(iconContent.includes("#012C7D"), "Favicon uses Primary Blue (#012C7D)");
  assert(iconContent.includes("#0B5ED7"), "Favicon uses Royal Blue (#0B5ED7)");

  // 2. Public Navigation & Header Component
  console.log("\n[2/6] Verifying Public Navigation & Responsive Header...");
  const headerContent = fs.readFileSync(
    path.join(webDir, "components/public/public-header.tsx"),
    "utf-8"
  );
  assert(headerContent.includes('"/features"'), "Header links to /features");
  assert(headerContent.includes('"/how-it-works"'), "Header links to /how-it-works");
  assert(headerContent.includes('"/about"'), "Header links to /about");
  assert(headerContent.includes('href="/login"'), "Header CTA links to /login");
  assert(headerContent.includes("md:hidden"), "Mobile drawer button uses md:hidden responsive trigger");
  assert(headerContent.includes("Escape"), "Mobile menu listens for Escape key dismissal");
  assert(headerContent.includes("aria-expanded"), "Mobile toggle has aria-expanded attribute");

  // 3. Public Footer & Legal Governance
  console.log("\n[3/6] Verifying Public Footer & Legal Links...");
  const footerContent = fs.readFileSync(
    path.join(webDir, "components/public/public-footer.tsx"),
    "utf-8"
  );
  assert(footerContent.includes('href="/privacy"'), "Footer links to /privacy");
  assert(footerContent.includes('href="/terms"'), "Footer links to /terms");
  assert(footerContent.includes("Clinical Disclaimer:"), "Footer includes clinical non-diagnostic disclaimer");
  assert(!footerContent.includes("twitter.com"), "Zero fake Twitter/social links");
  assert(!footerContent.includes("facebook.com"), "Zero fake Facebook links");
  assert(!footerContent.includes("50,000+"), "Zero fake metric or patient count claims");

  // 4. Accessibility Foundations
  console.log("\n[4/6] Verifying Accessibility Foundations...");
  const layoutContent = fs.readFileSync(
    path.join(webDir, "app/(public)/layout.tsx"),
    "utf-8"
  );
  assert(layoutContent.includes('href="#main-content"'), "Public layout includes skip-to-content link");
  assert(layoutContent.includes('id="main-content"'), "Public layout designates #main-content container");
  assert(layoutContent.includes('tabIndex={-1}'), "Main content is programmatically focusable (tabIndex={-1})");

  // 5. Landing Page Structure (APP-FLOW.md Section 3.2 & AGENT.md Section 14)
  console.log("\n[5/6] Verifying Landing Page Documented Structure...");
  const landingContent = fs.readFileSync(
    path.join(webDir, "app/(public)/page.tsx"),
    "utf-8"
  );
  assert(landingContent.includes("Intelligent Healthcare Management"), "Contains documented headline");
  assert(landingContent.includes("Why Arogyavajra?"), "Contains Why Arogyavajra section");
  assert(landingContent.includes("Core Platform Capabilities"), "Contains Core Capabilities section");
  assert(landingContent.includes("How Arogyavajra Works"), "Contains How It Works section");
  assert(landingContent.includes("Built for Every Healthcare Role"), "Contains Role-Based Platform section");
  assert(landingContent.includes("Security & Trust"), "Contains Security & Trust section");
  assert(landingContent.includes("Ready to use Arogyavajra?"), "Contains Final Call-to-Action section");

  // 6. Live Route HTTP Checks
  console.log("\n[6/6] Verifying Live Server Responses on http://localhost:3000...");
  const routesToTest = [
    { route: "/", expectedText: "Intelligent Healthcare Management", name: "Landing Page (/)" },
    { route: "/features", expectedText: "Platform Capabilities", name: "Features Page (/features)" },
    { route: "/how-it-works", expectedText: "Connected Clinical Healthcare Workflow", name: "How It Works (/how-it-works)" },
    { route: "/about", expectedText: "About Arogyavajra", name: "About Page (/about)" },
    { route: "/privacy", expectedText: "Privacy Policy", name: "Privacy Policy (/privacy)" },
    { route: "/terms", expectedText: "Terms &amp; Conditions", name: "Terms & Conditions (/terms)" },
    { route: "/design-system", expectedText: "Shared Frontend Infrastructure", name: "Design System Showcase (/design-system)" },
  ];

  for (const item of routesToTest) {
    try {
      const res = await fetchRoute(item.route);
      assert(res.statusCode === 200, `${item.name} responded with HTTP 200 OK`);
      assert(
        res.body.includes(item.expectedText) || res.body.includes(item.expectedText.replace("&amp;", "&")),
        `${item.name} rendered expected text snippet`
      );
    } catch (err) {
      assert(false, `${item.name} connection failed: ${err.message}`);
    }
  }

  console.log("\n============================================================");
  console.log(`  Summary: ${passed} passed, ${failed} failed`);
  console.log("============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
