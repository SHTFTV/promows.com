#!/usr/bin/env node
/**
 * Responsive QA check: verifies the info@promows.com mailto link is
 * visible (not hidden by CSS or conditional layout) in the header,
 * footer, and contact page across mobile / tablet / desktop breakpoints.
 *
 * On failure, writes per-route artifacts to qa-reports/mailto/:
 *   - <bp>__<route>__<region>.png   full-page screenshot
 *   - <bp>__<route>__<region>.html  serialized DOM snapshot
 *   - summary.json                  machine-readable failure list
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/qa-mailto.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const EMAIL = "info@promows.com";
const HREF = `mailto:${EMAIL}`;
const REPORT_DIR = "qa-reports/mailto";

const BREAKPOINTS = [
  { name: "mobile", width: 375, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const ROUTES = ["/", "/contact", "/blog", "/services", "/partners"];

async function checkRegion(page, region) {
  return await page.evaluate(
    ({ region, href, email }) => {
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
          if (r.width > 0 && r.height > 0 && a.textContent?.includes(email)) {
            return { ok: true, text: a.textContent.trim() };
          }
        }
      }
      return { ok: false, reason: `no visible mailto:${email} in <${region}>` };
    },
    { region, href: HREF, email: EMAIL }
  );
}

await rm(REPORT_DIR, { recursive: true, force: true });
const failures = [];
const browser = await chromium.launch();
try {
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      try {
        await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
      } catch (e) {
        const label = `${bp.name.padEnd(7)} ${route.padEnd(12)} nav`;
        console.log(`FAIL ${label}  ${e.message}`);
        failures.push({ breakpoint: bp.name, route, region: "nav", reason: e.message });
        continue;
      }
      const isContact = route === "/contact";
      const regions = isContact ? ["header", "footer", "main"] : ["header", "footer"];
      for (const region of regions) {
        const res = await checkRegion(page, region);
        const label = `${bp.name.padEnd(7)} ${route.padEnd(12)} ${region}`;
        if (res.ok) {
          console.log(`PASS ${label}  ${res.text}`);
          continue;
        }
        console.log(`FAIL ${label}  ${res.reason}`);
        await mkdir(REPORT_DIR, { recursive: true });
        const stem = `${bp.name}__${route.replace(/\//g, "_") || "root"}__${region}`;
        try {
          await page.screenshot({ path: join(REPORT_DIR, `${stem}.png`), fullPage: true });
          const html = await page.content();
          await writeFile(join(REPORT_DIR, `${stem}.html`), html);
        } catch {
          /* screenshot best-effort */
        }
        failures.push({
          breakpoint: bp.name,
          route,
          region,
          reason: res.reason,
          artifact: `${stem}.png`,
        });
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(
    join(REPORT_DIR, "summary.json"),
    JSON.stringify({ base: BASE, email: EMAIL, failures }, null, 2)
  );
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) {
    console.error(`  - [${f.breakpoint}] ${f.route} ${f.region} → ${f.reason}`);
  }
  console.error(`\nScreenshots + HTML snapshots written to ${REPORT_DIR}/`);
  process.exit(1);
}
console.log("\nAll breakpoints show info@promows.com in header/footer (+ contact main).");
