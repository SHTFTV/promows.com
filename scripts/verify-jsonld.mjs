#!/usr/bin/env node
/**
 * Build-time verification: fetches every /city/* and /blog/* URL from
 * the running server and greps the raw SSR HTML for Organization JSON-LD
 * containing info@promows.com.
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/verify-jsonld.mjs
 *
 * Exits non-zero if any URL is missing the tag or the email.
 * Reads the URL list from the sitemap so it stays in sync with routes.
 */
import { XMLParser } from "fast-xml-parser";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const EMAIL = "info@promows.com";

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

function checkHtml(html) {
  const blocks = [];
  let m;
  while ((m = JSONLD_RE.exec(html))) blocks.push(m[1]);
  if (!blocks.length) return { ok: false, reason: "no JSON-LD blocks" };
  for (const raw of blocks) {
    try {
      const data = JSON.parse(raw);
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const t = node?.["@type"];
        const types = Array.isArray(t) ? t : [t];
        if (types.includes("Organization") || types.includes("LocalBusiness")) {
          const emails = [
            node.email,
            ...(Array.isArray(node.contactPoint) ? node.contactPoint : [node.contactPoint])
              .filter(Boolean)
              .map((cp) => cp.email),
          ]
            .filter(Boolean)
            .map(String);
          if (emails.some((e) => e.toLowerCase().includes(EMAIL))) {
            return { ok: true, type: types.join(",") };
          }
        }
      }
    } catch {
      // Fallback: raw string match on this block.
      if (/"Organization"|"LocalBusiness"/.test(raw) && raw.includes(EMAIL)) {
        return { ok: true, type: "raw-match" };
      }
    }
  }
  return { ok: false, reason: `Organization/LocalBusiness JSON-LD with ${EMAIL} not found` };
}

const urls = await loadUrlsFromSitemap();
if (!urls.length) {
  console.error("No /city or /blog URLs found in sitemap.xml — nothing to check.");
  process.exit(1);
}

console.log(`Checking ${urls.length} URL(s) at ${BASE}\n`);
const failures = [];
for (const path of urls) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const status = res.status;
  const check = checkHtml(html);
  if (status === 200 && check.ok) {
    console.log(`PASS ${path}  (${check.type})`);
  } else {
    const reason = status !== 200 ? `HTTP ${status}` : check.reason;
    console.log(`FAIL ${path}  ${reason}`);
    failures.push(`${path} — ${reason}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  failures.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log(`\nAll city + blog pages ship Organization JSON-LD with ${EMAIL}.`);
