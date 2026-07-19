#!/usr/bin/env node
/**
 * Build-time verification: fetches every /city/* and /blog/* URL from the
 * running server and validates the emitted Organization / LocalBusiness
 * JSON-LD.
 *
 * For each URL we assert:
 *   - HTTP 200
 *   - An Organization or LocalBusiness JSON-LD block is present
 *   - It contains a well-formed PostalAddress (streetAddress, addressLocality,
 *     addressRegion)
 *   - It contains a ContactPoint (or top-level `email`) with info@promows.com
 *
 * Per-route failures are written to qa-reports/jsonld/<slug>.{html,json}
 * so you can inspect the offending HTML and parsed reason.
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/verify-jsonld.mjs
 */
import { XMLParser } from "fast-xml-parser";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const EMAIL = "info@promows.com";
const REPORT_DIR = "qa-reports/jsonld";

async function loadUrlsFromSitemap() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser();
  const doc = parser.parse(xml);
  const entries = doc?.urlset?.url ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list
    .map((u) => String(u.loc || ""))
    .filter((u) => /\/(city|blog)\//.test(u))
    .map((u) => u.replace(/^https?:\/\/[^/]+/, ""));
}

const JSONLD_RE = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function collectNodes(html) {
  const nodes = [];
  let m;
  while ((m = JSONLD_RE.exec(html))) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const n of arr) {
        if (n && n["@graph"] && Array.isArray(n["@graph"])) nodes.push(...n["@graph"]);
        else nodes.push(n);
      }
    } catch {
      nodes.push({ __rawParseError: true, __raw: raw });
    }
  }
  return nodes;
}

function typesOf(node) {
  const t = node?.["@type"];
  return Array.isArray(t) ? t : t ? [t] : [];
}

function validateAddress(addr) {
  if (!addr || typeof addr !== "object") return "missing PostalAddress";
  const missing = ["streetAddress", "addressLocality", "addressRegion"].filter(
    (f) => !addr[f] || String(addr[f]).trim() === ""
  );
  if (missing.length) return `PostalAddress missing: ${missing.join(", ")}`;
  return null;
}

function validateContactEmail(node) {
  const cps = Array.isArray(node.contactPoint)
    ? node.contactPoint
    : node.contactPoint
      ? [node.contactPoint]
      : [];
  const emails = [node.email, ...cps.map((cp) => cp?.email)]
    .filter(Boolean)
    .map((e) => String(e).replace(/^mailto:/i, "").trim());
  if (!emails.length) return "no email on Organization/LocalBusiness or ContactPoint";
  const malformed = emails.filter((e) => !EMAIL_RE.test(e));
  if (malformed.length) return `malformed email(s): ${malformed.join(", ")}`;
  if (!emails.some((e) => e.toLowerCase() === EMAIL)) {
    return `expected ${EMAIL}, saw: ${emails.join(", ")}`;
  }
  return null;
}

function checkHtml(html) {
  const nodes = collectNodes(html);
  if (!nodes.length) return { ok: false, reason: "no JSON-LD blocks emitted" };
  const parseErrors = nodes.filter((n) => n.__rawParseError);
  const orgs = nodes.filter((n) => {
    const ts = typesOf(n);
    return ts.includes("Organization") || ts.includes("LocalBusiness");
  });
  if (!orgs.length) {
    return {
      ok: false,
      reason: `no Organization/LocalBusiness node (parseErrors=${parseErrors.length})`,
    };
  }
  const errors = [];
  for (const node of orgs) {
    const addrErr = validateAddress(node.address);
    const emailErr = validateContactEmail(node);
    if (!addrErr && !emailErr) {
      return { ok: true, type: typesOf(node).join(",") };
    }
    errors.push(
      `[${typesOf(node).join(",")}] ${[addrErr, emailErr].filter(Boolean).join("; ")}`
    );
  }
  return { ok: false, reason: errors.join(" | ") };
}

function slugify(path) {
  return path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root";
}

await rm(REPORT_DIR, { recursive: true, force: true });
const urls = await loadUrlsFromSitemap();
if (!urls.length) {
  console.error("No /city or /blog URLs found in sitemap.xml — nothing to check.");
  process.exit(1);
}

console.log(`Checking ${urls.length} URL(s) at ${BASE}\n`);
const failures = [];
for (const path of urls) {
  let status = 0;
  let html = "";
  try {
    const res = await fetch(BASE + path);
    status = res.status;
    html = await res.text();
  } catch (e) {
    status = 0;
    html = `<!-- fetch error: ${(e && e.message) || e} -->`;
  }
  const check = status === 200 ? checkHtml(html) : { ok: false, reason: `HTTP ${status}` };
  if (check.ok) {
    console.log(`PASS ${path}  (${check.type})`);
    continue;
  }
  console.log(`FAIL ${path}  ${check.reason}`);
  failures.push({ path, status, reason: check.reason });

  await mkdir(REPORT_DIR, { recursive: true });
  const slug = slugify(path);
  const snippet = html.slice(0, 20000);
  await writeFile(join(REPORT_DIR, `${slug}.html`), snippet);
  await writeFile(
    join(REPORT_DIR, `${slug}.json`),
    JSON.stringify({ path, status, reason: check.reason, url: BASE + path }, null, 2)
  );
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f.path} — ${f.reason}`);
  console.error(`\nHTML snippets + reasons written to ${REPORT_DIR}/`);
  process.exit(1);
}
console.log(`\nAll city + blog pages ship valid Organization JSON-LD with ${EMAIL}.`);
