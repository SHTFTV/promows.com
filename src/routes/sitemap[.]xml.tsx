import { createFileRoute } from "@tanstack/react-router";
import { services, site } from "@/data/site";

const staticPaths = ["/", "/services", "/about", "/contact", "/partners"];

function buildSitemap(origin: string) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...staticPaths.map((p) => ({ loc: `${origin}${p}`, priority: p === "/" ? "1.0" : "0.8" })),
    ...services.map((s) => ({ loc: `${origin}/services/${s.slug}`, priority: "0.7" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}

export const Route = createFileRoute("/sitemap[.]xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
        const host = request.headers.get("host") ?? site.domain;
        const origin = `${proto}://${host}`;
        return new Response(buildSitemap(origin), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
