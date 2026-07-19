import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock } from "lucide-react";
import { posts } from "@/data/blog";
import { SITE_URL, OG_IMAGE_URL, seoLinks, site } from "@/data/site";

const TITLE = "The ProMows Blog — Lawn & Landscape Field Notes";
const DESCRIPTION =
  "Practical guides from ProMows crews on mowing, seasonal cleanups, landscape design, and year-round property care.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/blog` },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:locale", content: site.locale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/blog"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "The ProMows Blog",
          url: `${SITE_URL}/blog`,
          publisher: {
            "@type": "Organization",
            name: site.name,
            url: SITE_URL,
          },
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
            author: { "@type": "Organization", name: p.author },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          ],
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const sorted = [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">
            The ProMows Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{DESCRIPTION}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {sorted.map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-primary">
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 font-heading text-2xl font-extrabold text-foreground group-hover:text-primary">
                  {p.title}
                </h2>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <time dateTime={p.publishedAt}>
                      {new Date(p.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.readMinutes} min read
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
