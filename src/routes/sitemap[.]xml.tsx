import { createFileRoute } from "@tanstack/react-router";
import { services, site } from "@/data/site";
import { getPublishedCities, getPublishedPosts } from "@/lib/content.functions";

interface Entry {
  path: string;
  priority: string;
  changefreq: "weekly" | "monthly" | "yearly";
  lastmod?: string;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

async function buildEntries(): Promise<Entry[]> {
  const today = TODAY();
  const staticPages: Entry[] = [
    { path: "/", priority: "1.0", changefreq: "weekly", lastmod: today },
    { path: "/services", priority: "0.8", changefreq: "monthly", lastmod: today },
    { path: "/about", priority: "0.6", changefreq: "yearly", lastmod: today },
    { path: "/contact", priority: "0.7", changefreq: "yearly", lastmod: today },
    { path: "/partners", priority: "0.6", changefreq: "monthly", lastmod: today },
    { path: "/blog", priority: "0.8", changefreq: "weekly", lastmod: today },
  ];

  const serviceEntries: Entry[] = services.map((s) => ({
    path: `/services/${s.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: today,
  }));

  const [cities, posts] = await Promise.all([getPublishedCities(), getPublishedPosts()]);

  const cityEntries: Entry[] = cities.map((c) => ({
    path: `/city/${c.slug}`,
    priority: "0.8",
    changefreq: "monthly",
    lastmod: c.updatedAt || today,
  }));

  const postEntries: Entry[] = posts.map((p) => ({
    path: `/blog/${p.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: p.updatedAt || today,
  }));

  return [...staticPages, ...serviceEntries, ...cityEntries, ...postEntries];
}


function renderXml(origin: string, entries: Entry[]): string {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${origin}${e.path}</loc>
    <lastmod>${e.lastmod ?? TODAY()}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
        const host = request.headers.get("host") ?? site.domain;
        const origin = `${proto}://${host}`;
        return new Response(renderXml(origin, await buildEntries()), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
