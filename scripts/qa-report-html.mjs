#!/usr/bin/env node
/**
 * Generates qa-reports/summary.html from mailto + jsonld results.ndjson.
 * Highlights the exact failing assertion per route and links to the stored
 * artifacts (screenshots, HTML snippets, per-route JSON, and diff).
 *
 * Usage: node scripts/qa-report-html.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = "qa-reports/summary.html";
const MAILTO_NDJSON = "qa-reports/mailto/results.ndjson";
const JSONLD_NDJSON = "qa-reports/jsonld/results.ndjson";
const DIFF_JSON = "qa-reports/jsonld/diff.json";

async function loadNdjson(p) {
  if (!existsSync(p)) return [];
  const raw = await readFile(p, "utf8");
  return raw.split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
const slugify = (p) => p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root";
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const mailto = await loadNdjson(MAILTO_NDJSON);
const jsonld = await loadNdjson(JSONLD_NDJSON);
const diff = existsSync(DIFF_JSON) ? JSON.parse(await readFile(DIFF_JSON, "utf8")) : null;

const mailFail = mailto.filter((r) => !r.ok);
const jsonFail = jsonld.filter((r) => !r.ok);

const mailtoRows = mailFail.map((r) => {
  const stem = `${r.breakpoint}__${(r.route || "").replace(/\//g, "_") || "root"}__${r.region}`;
  return `<tr>
    <td>${esc(r.breakpoint)}</td>
    <td><a href="${esc(r.url)}" target="_blank">${esc(r.route)}</a></td>
    <td>${esc(r.region)}</td>
    <td>${esc(r.status ?? "?")}</td>
    <td class="fail">${esc(r.reason)}</td>
    <td>
      <a href="mailto/${stem}.png">📸 png</a> ·
      <a href="mailto/${stem}.html">html</a>
    </td>
  </tr>`;
}).join("");

const jsonldRows = jsonFail.map((r) => {
  const slug = slugify(r.path);
  const failed = r.failedAssertions.map((a) =>
    `<div><code class="assert">${esc(a.name)}</code>: ${esc(a.detail)}</div>`).join("");
  return `<tr>
    <td><a href="${esc(r.url)}" target="_blank">${esc(r.path)}</a></td>
    <td>${esc(r.routeKind)}</td>
    <td>${esc(r.status)}</td>
    <td>${esc((r.entityTypes || []).join(", "))}</td>
    <td class="fail">${failed}</td>
    <td>
      <a href="jsonld/${slug}.json">json</a> ·
      <a href="jsonld/${slug}.html">html snippet</a> ·
      <a href="jsonld/snapshots/${slug}.json">snapshot</a>
    </td>
  </tr>`;
}).join("");

const diffSection = diff ? `
  <h2>JSON-LD diff vs previous run</h2>
  <p>+${diff.added.length} added · -${diff.removed.length} removed · ~${diff.changed.length} changed
     (<a href="jsonld/diff.txt">diff.txt</a> · <a href="jsonld/diff.json">diff.json</a>)</p>
  ${diff.changed.length ? `<table>
    <thead><tr><th>Route</th><th>+ blocks</th><th>- blocks</th><th>Added sample</th><th>Removed sample</th></tr></thead>
    <tbody>${diff.changed.map((c) => `<tr>
      <td>${esc(c.path)}</td><td>${c.addedBlocks}</td><td>${c.removedBlocks}</td>
      <td><pre>${esc(c.sample?.added || "")}</pre></td>
      <td><pre>${esc(c.sample?.removed || "")}</pre></td>
    </tr>`).join("")}</tbody></table>` : ""}
` : "";

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>ProMows QA report</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; margin: 24px; color: #0f172a; }
  h1 { margin: 0 0 4px; } h2 { margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  th { background: #f1f5f9; }
  .fail { color: #b91c1c; }
  .pass { color: #15803d; }
  code.assert { background: #fee2e2; padding: 1px 4px; border-radius: 3px; }
  pre { background: #f8fafc; padding: 6px; max-width: 380px; overflow: auto; font-size: 12px; }
  .stat { display: inline-block; margin-right: 16px; padding: 6px 12px; border-radius: 6px; background: #f1f5f9; }
</style></head><body>
  <h1>ProMows QA report</h1>
  <p>Generated ${new Date().toISOString()}</p>
  <p>
    <span class="stat">mailto: ${mailto.length - mailFail.length} pass · <span class="fail">${mailFail.length} fail</span></span>
    <span class="stat">jsonld: ${jsonld.length - jsonFail.length} pass · <span class="fail">${jsonFail.length} fail</span></span>
  </p>

  <h2>mailto failures</h2>
  ${mailFail.length ? `<table>
    <thead><tr><th>Breakpoint</th><th>Route</th><th>Region</th><th>HTTP</th><th>Reason</th><th>Artifacts</th></tr></thead>
    <tbody>${mailtoRows}</tbody></table>` : `<p class="pass">All mailto checks passed.</p>`}

  <h2>JSON-LD failures</h2>
  ${jsonFail.length ? `<table>
    <thead><tr><th>Route</th><th>Kind</th><th>HTTP</th><th>Entity types</th><th>Failed assertions</th><th>Artifacts</th></tr></thead>
    <tbody>${jsonldRows}</tbody></table>` : `<p class="pass">All JSON-LD checks passed.</p>`}

  ${diffSection}
</body></html>`;

await writeFile(OUT, html);
console.log(`Wrote ${OUT} (${mailFail.length + jsonFail.length} failure row(s))`);
