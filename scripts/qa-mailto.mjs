#!/usr/bin/env node
/**
 * Responsive QA check: verifies the info@promows.com mailto link is
 * visible in header/footer/contact across mobile/tablet/desktop.
 *
 * Emits qa-reports/mailto/results.ndjson (one JSON per check) with
 * base URL, HTTP status, route, region, breakpoint, and pass/fail.
 * On failure also writes .png + .html snapshots and summary.json.
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/qa-mailto.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile, appendFile, rm } from "node:fs/promises";
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
await mkdir(REPORT_DIR, { recursive: true });
const NDJSON = join(REPORT_DIR, "results.ndjson");
const failures = [];
const browser = await chromium.launch();
try {
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      const url = BASE + route;
      let httpStatus = 0;
      try {
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        httpStatus = resp?.status() ?? 0;
      } catch (e) {
        const rec = { base: BASE, url, breakpoint: bp.name, route, region: "nav",
          status: 0, ok: false, reason: e.message };
        await appendFile(NDJSON, JSON.stringify(rec) + "\n");
        console.log(`FAIL ${bp.name.padEnd(7)} ${route.padEnd(12)} nav  ${e.message}`);
        failures.push(rec);
        continue;
      }
      const isContact = route === "/contact";
      const regions = isContact ? ["header", "footer", "main"] : ["header", "footer"];
      for (const region of regions) {
        const res = await checkRegion(page, region);
        const rec = { base: BASE, url, breakpoint: bp.name, route, region,
          status: httpStatus, ok: res.ok, reason: res.ok ? null : res.reason,
          text: res.text ?? null };
        await appendFile(NDJSON, JSON.stringify(rec) + "\n");
        const label = `${bp.name.padEnd(7)} ${route.padEnd(12)} ${region}`;
        if (res.ok) {
          console.log(`PASS ${label}  [${httpStatus}] ${res.text}`);
          continue;
        }
        console.log(`FAIL ${label}  [${httpStatus}] ${res.reason}`);
        const stem = `${bp.name}__${route.replace(/\//g, "_") || "root"}__${region}`;
        try {
          await page.screenshot({ path: join(REPORT_DIR, `${stem}.png`), fullPage: true });
          await writeFile(join(REPORT_DIR, `${stem}.html`), await page.content());
        } catch { /* best-effort */ }
        failures.push({ ...rec, artifact: `${stem}.png` });
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}


if (failures.length) {
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
