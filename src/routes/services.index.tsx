import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Droplets, Leaf, Scissors, Sprout, TreePine } from "lucide-react";
import { services, site } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

const iconMap = { Scissors, Sprout, TreePine, Leaf, Droplets, CalendarDays } as const;

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Lawn & Landscape Services — ProMows" },
      {
        name: "description",
        content:
          "Mowing, landscape design, hedge and tree trimming, yard cleanups, fertilization, and seasonal cleanups. Flat pricing, on-time crews, across North America.",
      },
      { property: "og:title", content: "Lawn & Landscape Services — ProMows" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://${site.domain}/services/${s.slug}`,
            name: s.title,
          })),
        }),
      },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            One crew for the whole growing season. Every service is flat-priced, fully insured,
            and finishes with a full cleanup.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Leaf;
            return (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-heading text-xl font-bold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <PartnerCallout />
    </>
  );
}
