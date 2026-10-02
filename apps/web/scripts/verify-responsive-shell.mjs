/**
 * Arogyavajra Frontend Verification Suite: Responsive Shared Shell & UI Primitives
 *
 * Validates:
 * 1. Visual tokens & color palette conformity with UI-UX-BRIEF.md
 * 2. Component exports and structural integrity
 * 3. Accessibility landmarks (skip-to-content, aria-label, dialog traps, alert roles)
 * 4. Responsive design rules (Mobile, Tablet, Desktop)
 * 5. Live Next.js server DOM inspection
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

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

async function run() {
  console.log("============================================================");
  console.log("  Arogyavajra Shared Frontend Infrastructure Verification  ");
  console.log("============================================================\n");

  // 1. Verify Visual Design Tokens in Tailwind Config
  console.log("[1/5] Verifying Visual Design Tokens & Palette Conformity...");
  const tailwindPath = path.join(webDir, "tailwind.config.ts");
  const tailwindContent = fs.readFileSync(tailwindPath, "utf-8");

  assert(tailwindContent.includes('"#021C48"'), "Contains Deep Navy (#021C48)");
  assert(tailwindContent.includes('"#012C7D"'), "Contains Primary Blue (#012C7D)");
  assert(tailwindContent.includes('"#0B5ED7"'), "Contains Royal Blue (#0B5ED7)");
  assert(tailwindContent.includes('"#E5F0FE"'), "Contains Soft Blue (#E5F0FE)");
  assert(tailwindContent.includes('"#F6F9FD"'), "Contains Background Blue (#F6F9FD)");
  assert(tailwindContent.includes('"#DDE6F2"'), "Contains Clinical Border (#DDE6F2)");
  assert(tailwindContent.includes('"#16A765"'), "Contains Healthcare Success (#16A765)");
  assert(tailwindContent.includes('"#DC3545"'), "Contains Healthcare Danger (#DC3545)");
  assert(tailwindContent.includes('"#D97706"'), "Contains Healthcare Warning (#D97706)");

  // 2. Verify Component Library Architecture & Exports
  console.log("\n[2/5] Verifying Component Primitives & Layout Architecture...");
  const uiIndex = fs.readFileSync(path.join(webDir, "components/ui/index.ts"), "utf-8");
  const layoutIndex = fs.readFileSync(path.join(webDir, "components/layout/index.ts"), "utf-8");

  assert(uiIndex.includes('export * from "./button"'), "Button primitive exported");
  assert(uiIndex.includes('export * from "./input"'), "Input primitive exported");
  assert(uiIndex.includes('export * from "./card"'), "Card primitive exported");
  assert(uiIndex.includes('export * from "./dialog"'), "Dialog primitive exported");
  assert(uiIndex.includes('export * from "./table"'), "Table primitive exported");
  assert(uiIndex.includes('export * from "./badge"'), "Badge primitive exported");
  assert(uiIndex.includes('export * from "./alert"'), "Alert primitive exported");
  assert(uiIndex.includes('export * from "./empty-state"'), "EmptyState primitive exported");
  assert(uiIndex.includes('export * from "./skeleton"'), "Skeleton primitive exported");

  assert(layoutIndex.includes('export * from "./app-shell"'), "AppShell layout exported");
  assert(layoutIndex.includes('export * from "./sidebar"'), "Sidebar layout exported");
  assert(layoutIndex.includes('export * from "./header"'), "Header layout exported");
  assert(layoutIndex.includes('export * from "./breadcrumbs"'), "Breadcrumbs layout exported");
  assert(layoutIndex.includes('export * from "./page-header"'), "PageHeader layout exported");

  // 3. Verify Accessibility Foundations
  console.log("\n[3/5] Verifying Accessibility (WCAG 2.1 AA) Foundations...");
  const appShellContent = fs.readFileSync(path.join(webDir, "components/layout/app-shell.tsx"), "utf-8");
  const globalsCss = fs.readFileSync(path.join(webDir, "app/globals.css"), "utf-8");
  const dialogContent = fs.readFileSync(path.join(webDir, "components/ui/dialog.tsx"), "utf-8");

  assert(appShellContent.includes('href="#main-content"'), "Skip link targets #main-content");
  assert(appShellContent.includes('className="skip-to-content"'), "Skip link has .skip-to-content class");
  assert(globalsCss.includes(".skip-to-content"), "globals.css defines accessible .skip-to-content styles");
  assert(globalsCss.includes(":focus-visible"), "globals.css defines visible focus outline tokens");
  assert(dialogContent.includes('role="dialog"'), "Dialog modal has role='dialog'");
  assert(dialogContent.includes('aria-modal="true"'), "Dialog modal has aria-modal='true'");
  assert(dialogContent.includes("Escape"), "Dialog modal listens for Escape key dismissal");

  // 4. Verify Responsive Breakpoints (Mobile, Tablet, Desktop)
  console.log("\n[4/5] Verifying Mobile, Tablet, and Desktop Shell Layout Behavior...");
  const sidebarContent = fs.readFileSync(path.join(webDir, "components/layout/sidebar.tsx"), "utf-8");
  const headerContent = fs.readFileSync(path.join(webDir, "components/layout/header.tsx"), "utf-8");

  // Mobile / Tablet rules
  assert(
    sidebarContent.includes("-translate-x-full"),
    "Mobile: Sidebar is hidden off-screen by default with -translate-x-full"
  );
  assert(
    sidebarContent.includes("lg:hidden"),
    "Mobile/Tablet: Backdrop overlay is active only below desktop (lg:hidden)"
  );
  assert(
    headerContent.includes("lg:hidden"),
    "Mobile/Tablet: Hamburger menu trigger button is rendered on small viewports (lg:hidden)"
  );

  // Desktop rules
  assert(
    sidebarContent.includes("lg:static lg:translate-x-0"),
    "Desktop: Sidebar transitions to permanent in-flow navigation on large viewports (lg:static lg:translate-x-0)"
  );
  assert(
    sidebarContent.includes("w-64"),
    "Desktop: Sidebar has fixed 256px width (w-64) per UI-UX specification"
  );

  // Role Configurations (all 5 roles per UI-UX-BRIEF.md Section 19)
  assert(sidebarContent.includes("PATIENT:"), "Configured navigation items for PATIENT role");
  assert(sidebarContent.includes("DOCTOR:"), "Configured navigation items for DOCTOR role");
  assert(sidebarContent.includes("RECEPTIONIST:"), "Configured navigation items for RECEPTIONIST role");
  assert(sidebarContent.includes("BILLING_STAFF:"), "Configured navigation items for BILLING_STAFF role");
  assert(sidebarContent.includes("ADMIN:"), "Configured navigation items for ADMIN role");

  // 5. Verify Live Server DOM & Rendered HTML on /design-system
  console.log("\n[5/5] Verifying Live Next.js Web Server (http://localhost:3000/design-system)...");
  try {
    const res = await fetchPage("http://localhost:3000/design-system");
    assert(res.statusCode === 200, `Next.js server responds with HTTP ${res.statusCode}`);
    assert(res.body.includes("skip-to-content"), "Rendered HTML contains skip-to-content landmark");
    assert(res.body.includes('id="main-content"'), "Rendered HTML contains id='main-content'");
    assert(res.body.includes("Arogyavajra"), "Rendered HTML contains Arogyavajra branding");
    assert(res.body.includes("Shared Frontend Infrastructure"), "Rendered HTML contains PageHeader title");
    assert(res.body.includes("Deep Navy"), "Rendered HTML contains Palette tokens showcase");
  } catch (err) {
    assert(false, `Could not connect to http://localhost:3000/design-system: ${err.message}`);
  }

  console.log("\n============================================================");
  console.log(`  Summary: ${passed} passed, ${failed} failed`);
  console.log("============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error in verification suite:", err);
  process.exit(1);
});
