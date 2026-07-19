#!/usr/bin/env node
/**
 * Responsive QA check: verifies the info@promows.com mailto link is
 * visible (not hidden by CSS or conditional layout) in the header,
 * footer, and contact page across mobile / tablet / desktop breakpoints.
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/qa-mailto.mjs
 *
 * Requires playwright to be installed (`bun add -d playwright` or
 * `npx playwright install chromium` first).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const EMAIL = "info@promows.com";
const HREF = `mailto:${EMAIL}`;

const BREAKPOINTS = [
  { name: "mobile", width: 375, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const ROUTES = ["/", "/contact", "/blog", "/services", "/partners"];
const REGIONS = ["header", "footer", "main"];

function isVisibleRect(box) {
  return box && box.width > 0 && box.height > 0;
}

async function checkRegion(page, region) {
  return await page.evaluate(
    ({ region, href }) => {
      const scopes =
        region === "main"
          ? [document.querySelector("main") || document.body]
          : Array.from(document.querySelectorAll(region));
      for (const scope of scopes) {
        if (!scope) continue;
        const links = scope.querySelectorAll(`a[href="${href}"]`);
        for (const a of links) {
          const cs = getComputedStyle(a);
          if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
          const r = a.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && a.textContent?.includes("info@promows.com")) {
            return { ok: true, text: a.textContent.trim() };
          }
        }
      }
      return { ok: false };
    },
    { region, href: HREF }
  );
}

const failures = [];
const browser = await chromium.launch();
try {
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      const isContact = route === "/contact";
      const regions = isContact ? ["header", "footer", "main"] : ["header", "footer"];
      for (const region of regions) {
        const res = await checkRegion(page, region);
        const label = `${bp.name.padEnd(7)} ${route.padEnd(12)} ${region}`;
        if (res.ok) {
          console.log(`PASS ${label}  ${res.text}`);
        } else {
          console.log(`FAIL ${label}  no visible mailto:${EMAIL}`);
          failures.push(label);
        }
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  failures.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("\nAll breakpoints show info@promows.com in header/footer (+ contact main).");
