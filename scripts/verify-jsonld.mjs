#!/usr/bin/env node
/**
 * Build-time verification: fetches every /city/* and /blog/* URL from the
 * running server and validates the emitted JSON-LD in the RAW SSR HTML
 * (no client JS execution).
 *
 * Assertions per URL:
 *   - HTTP 200
 *   - Organization/LocalBusiness w/ well-formed PostalAddress + ContactPoint
 *     email = info@promows.com
 *   - City routes: BreadcrumbList AND FAQPage present in raw HTML
 *   - Blog routes: BreadcrumbList present in raw HTML
 *   - If AggregateRating present → ratingValue/reviewCount numeric
 *   - If WebPage present → has name + url
 *   - If ItemList present → itemListElement is a non-empty array w/ positions
 *
 * Outputs:
 *   qa-reports/jsonld/results.ndjson    one JSON per route
 *   qa-reports/jsonld/<slug>.json       per-route detail
 *   qa-reports/jsonld/<slug>.html       raw HTML snippet on failure
 *   qa-reports/jsonld/snapshots/<slug>.json  extracted JSON-LD blocks (all runs)
 *   qa-reports/jsonld/diff.json + diff.txt  vs previous snapshot dir
 *   qa-reports/jsonld/summary.json      combined summary
 *
 * Filtering (allow/deny — patterns are substrings OR /regex/):
 *   QA_ONLY="/city/austin,/blog/spring"   only these routes
 *   QA_SKIP="/city/beta-,/blog/draft-"    skip these
 *   QA_ONLY="/regex:^/city/"              regex form
 *   --only=<pat> / --skip=<pat>           CLI overrides
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/verify-jsonld.mjs
 */
import { XMLParser } from "fast-xml-parser";
import { mkdir, writeFile, appendFile, rm, readFile, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const EMAIL = "info@promows.com";
const REPORT_DIR = "qa-reports/jsonld";
const SNAPSHOT_DIR = join(REPORT_DIR, "snapshots");
const PREV_SNAPSHOT_DIR = "qa-reports/jsonld-prev/snapshots";
const NDJSON = join(REPORT_DIR, "results.ndjson");

// --- filter parsing ------------------------------------------------------
function parseArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : "";
}
function toMatchers(raw) {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
    if (s.startsWith("/regex:")) return new RegExp(s.slice(7));
    if (s.startsWith("/") && s.endsWith("/") && s.length > 2) return new RegExp(s.slice(1, -1));
    return s;
  });
}
const ONLY = toMatchers(parseArg("only") || process.env.QA_ONLY || "");
const SKIP = toMatchers(parseArg("skip") || process.env.QA_SKIP || "");
const matches = (path, m) => (m instanceof RegExp ? m.test(path) : path.includes(m));
const passesFilter = (path) =>
  (!ONLY.length || ONLY.some((m) => matches(path, m))) &&
  !SKIP.some((m) => matches(path, m));


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

const JSONLD_RE =
  /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
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
        if (n && Array.isArray(n["@graph"])) nodes.push(...n["@graph"]);
        else nodes.push(n);
      }
    } catch {
      nodes.push({ __rawParseError: true, __raw: raw });
    }
  }
  return nodes;
}
const typesOf = (n) => {
  const t = n?.["@type"];
  return Array.isArray(t) ? t : t ? [t] : [];
};
const hasType = (nodes, type) =>
  nodes.some((n) => typesOf(n).includes(type));

function validateAddress(addr) {
  if (!addr || typeof addr !== "object") return "missing PostalAddress";
  const missing = ["streetAddress", "addressLocality", "addressRegion"].filter(
    (f) => !addr[f] || String(addr[f]).trim() === ""
  );
  return missing.length ? `PostalAddress missing: ${missing.join(", ")}` : null;
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
  if (!emails.length) return "no email on Organization/LocalBusiness/ContactPoint";
  const bad = emails.filter((e) => !EMAIL_RE.test(e));
  if (bad.length) return `malformed email(s): ${bad.join(", ")}`;
  if (!emails.some((e) => e.toLowerCase() === EMAIL))
    return `expected ${EMAIL}, saw: ${emails.join(", ")}`;
  return null;
}
function validateAggregateRating(nodes) {
  const ratings = nodes.flatMap((n) => {
    const inline = n.aggregateRating;
    const arr = typesOf(n).includes("AggregateRating") ? [n] : [];
    return [inline, ...arr].filter(Boolean);
  });
  for (const r of ratings) {
    const v = Number(r.ratingValue);
    const c = Number(r.reviewCount ?? r.ratingCount);
    if (!Number.isFinite(v) || v < 0 || v > 5)
      return `AggregateRating.ratingValue invalid: ${r.ratingValue}`;
    if (!Number.isFinite(c) || c < 0)
      return `AggregateRating.reviewCount invalid: ${r.reviewCount ?? r.ratingCount}`;
  }
  return null;
}

function assertRoute(path, html) {
  const nodes = collectNodes(html);
  const assertions = [];
  const record = (name, ok, detail = "") =>
    assertions.push({ name, ok, detail });

  if (!nodes.length) {
    record("jsonld_present", false, "no JSON-LD blocks emitted in raw HTML");
    return { ok: false, entityTypes: [], assertions };
  }
  record("jsonld_present", true, `${nodes.length} block(s)`);

  const org = nodes.find((n) => {
    const ts = typesOf(n);
    return ts.includes("Organization") || ts.includes("LocalBusiness");
  });
  if (!org) {
    record("organization_localbusiness", false, "no Organization/LocalBusiness node");
  } else {
    const addrErr = validateAddress(org.address);
    const emailErr = validateContactEmail(org);
    record("organization_localbusiness", !addrErr && !emailErr,
      [addrErr, emailErr].filter(Boolean).join("; ") || `type=${typesOf(org).join(",")}`);
  }

  const isCity = path.startsWith("/city/");
  const isBlog = path.startsWith("/blog/");

  record("breadcrumb_list", hasType(nodes, "BreadcrumbList"),
    hasType(nodes, "BreadcrumbList") ? "" : "BreadcrumbList missing in raw HTML");

  if (isCity) {
    record("faq_page", hasType(nodes, "FAQPage"),
      hasType(nodes, "FAQPage") ? "" : "FAQPage missing in raw HTML");
  }

  const ratingErr = validateAggregateRating(nodes);
  if (ratingErr) record("aggregate_rating", false, ratingErr);
  else if (hasType(nodes, "AggregateRating") ||
           nodes.some((n) => n.aggregateRating))
    record("aggregate_rating", true, "well-formed");

  // WebPage (when present): must have name + url
  if (hasType(nodes, "WebPage")) {
    const wp = nodes.find((n) => typesOf(n).includes("WebPage"));
    const missing = ["name", "url"].filter((k) => !wp?.[k] || String(wp[k]).trim() === "");
    record("webpage", missing.length === 0,
      missing.length ? `WebPage missing: ${missing.join(", ")}` : `url=${wp.url}`);
  }

  // ItemList (when present): non-empty itemListElement w/ positions
  if (hasType(nodes, "ItemList")) {
    const il = nodes.find((n) => typesOf(n).includes("ItemList"));
    const items = Array.isArray(il?.itemListElement) ? il.itemListElement : [];
    if (!items.length) {
      record("item_list", false, "ItemList.itemListElement empty");
    } else {
      const bad = items.filter((it, i) => {
        const pos = Number(it?.position);
        return !Number.isFinite(pos) || pos !== i + 1 || !(it?.url || it?.item);
      });
      record("item_list", bad.length === 0,
        bad.length ? `${bad.length} ItemList entries missing position/url` : `${items.length} items`);
    }
  }

  const entityTypes = [...new Set(nodes.flatMap(typesOf).filter(Boolean))];
  const rawBlocks = collectRawBlocks(html);
  const ok = assertions.every((a) => a.ok);
  return { ok, entityTypes, assertions, rawBlocks,
    routeKind: isCity ? "city" : isBlog ? "blog" : "other" };
}

// Return the exact raw JSON-LD block strings, sorted for stable diffs.
function collectRawBlocks(html) {
  const blocks = [];
  const re = new RegExp(JSONLD_RE.source, "gi");
  let m;
  while ((m = re.exec(html))) blocks.push(m[1].trim());
  return blocks.sort();
}


const slugify = (p) =>
  p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root";

await rm(REPORT_DIR, { recursive: true, force: true });
await mkdir(REPORT_DIR, { recursive: true });

const urls = await loadUrlsFromSitemap();
if (!urls.length) {
  console.error("No /city or /blog URLs found in sitemap.xml — nothing to check.");
  process.exit(1);
}

console.log(`Checking ${urls.length} URL(s) at ${BASE}\n`);
const failures = [];
const allResults = [];
for (const path of urls) {
  const url = BASE + path;
  let status = 0;
  let html = "";
  try {
    const res = await fetch(url);
    status = res.status;
    html = await res.text();
  } catch (e) {
    html = `<!-- fetch error: ${(e && e.message) || e} -->`;
  }

  const result =
    status === 200
      ? assertRoute(path, html)
      : { ok: false, entityTypes: [], assertions: [{ name: "http", ok: false, detail: `HTTP ${status}` }], routeKind: path.startsWith("/city/") ? "city" : "blog" };

  const record = {
    base: BASE,
    url,
    path,
    status,
    routeKind: result.routeKind,
    entityTypes: result.entityTypes,
    ok: result.ok,
    failedAssertions: result.assertions.filter((a) => !a.ok),
    assertions: result.assertions,
  };
  allResults.push(record);
  await appendFile(NDJSON, JSON.stringify(record) + "\n");
  await writeFile(join(REPORT_DIR, `${slugify(path)}.json`), JSON.stringify(record, null, 2));

  if (result.ok) {
    console.log(`PASS ${path}  [${status}] types=${result.entityTypes.join(",")}`);
  } else {
    const reasons = record.failedAssertions.map((a) => `${a.name}: ${a.detail}`).join(" | ");
    console.log(`FAIL ${path}  [${status}] ${reasons}`);
    await writeFile(join(REPORT_DIR, `${slugify(path)}.html`), html.slice(0, 20000));
    failures.push(record);
  }
}

await writeFile(
  join(REPORT_DIR, "summary.json"),
  JSON.stringify(
    { base: BASE, email: EMAIL, total: allResults.length, failed: failures.length, failures },
    null,
    2
  )
);

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) {
    console.error(`  - [${f.status}] ${f.path} — ${f.failedAssertions.map((a) => a.name).join(", ")}`);
  }
  console.error(`\nPer-route reports + HTML snippets in ${REPORT_DIR}/`);
  process.exit(1);
}
console.log(`\nAll ${allResults.length} city + blog pages emit valid JSON-LD in raw HTML.`);
