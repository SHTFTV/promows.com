import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2, Droplets, Leaf, Scissors, Sprout, TreePine } from "lucide-react";
import { serviceBySlug, services, site } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

const iconMap = { Scissors, Sprout, TreePine, Leaf, Droplets, CalendarDays } as const;

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = serviceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ params, loaderData }) => {
    const s = loaderData?.service;
    const title = s ? `${s.title} — ProMows` : "Service — ProMows";
    const desc = s?.short ?? "Professional lawn and landscape service by ProMows.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/services/${params.slug}` },
        ...(s ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
      scripts: s
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                name: s.title,
                description: s.description,
                provider: { "@type": "Organization", name: site.name, url: `https://${site.domain}` },
                areaServed: site.serviceArea,
                url: `https://${site.domain}/services/${s.slug}`,
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: `https://${site.domain}/` },
                  { "@type": "ListItem", position: 2, name: "Services", item: `https://${site.domain}/services` },
                  { "@type": "ListItem", position: 3, name: s.title, item: `https://${site.domain}/services/${s.slug}` },
                ],
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-extrabold">Service not found</h1>
      <p className="mt-3 text-muted-foreground">The service you're looking for doesn't exist.</p>
      <Link to="/services" className="mt-6 inline-block font-bold text-primary hover:underline">
        See all services →
      </Link>
    </div>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Leaf;
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
          <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/services" className="hover:underline">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{service.title}</span>
          </nav>
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h1 className="font-heading text-4xl font-extrabold md:text-5xl">{service.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{service.short}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-10 px-4 py-16 md:grid-cols-[2fr_1fr]">
        <article className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-foreground">{service.description}</p>
          <h2 className="mt-8 font-heading text-2xl font-bold">What's included</h2>
          <ul className="mt-4 space-y-3">
            {service.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold">Get a free quote</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us your address and we'll come back with a flat price within 24 hours.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Request quote <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>

      <section className="border-t border-border bg-accent/30 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-heading text-2xl font-bold">Other services</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((s) => {
              const OI = iconMap[s.icon as keyof typeof iconMap] ?? Leaf;
              return (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <OI className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.short}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <PartnerCallout />
    </>
  );
}
