import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, MapPin } from "lucide-react";
import { cityBySlug, cities } from "@/data/cities";
import { serviceBySlug, site, SITE_URL, LOGO_URL, OG_IMAGE_URL, seoLinks } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

export const Route = createFileRoute("/city/$slug")({
  loader: ({ params }) => {
    const city = cityBySlug(params.slug);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.city;
    const title = c
      ? `Lawn Care in ${c.name}, ${c.state} — ProMows`
      : "City — ProMows";
    const description = c
      ? `Weekly mowing, landscape design, cleanups, and fertilization across ${c.name}, ${c.state}. Trusted ProMows crews serving ${c.neighborhoods.slice(0, 3).join(", ")} and nearby.`
      : "ProMows lawn and landscape service by city.";
    const path = `/city/${params.slug}`;

    if (!c) {
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { name: "robots", content: "noindex" },
        ],
        links: seoLinks(path),
      };
    }

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}${path}` },
        { property: "og:image", content: OG_IMAGE_URL },
        { property: "og:locale", content: site.locale },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: OG_IMAGE_URL },
      ],
      links: seoLinks(path),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${SITE_URL}${path}#business`,
            name: `${site.name} — ${c.name}, ${c.state}`,
            url: `${SITE_URL}${path}`,
            logo: LOGO_URL,
            image: OG_IMAGE_URL,
            telephone: site.phone,
            email: site.email,
            priceRange: "$$",
            areaServed: {
              "@type": "City",
              name: c.name,
              containedInPlace: { "@type": "State", name: c.state },
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: c.name,
              addressRegion: c.state,
              addressCountry: "US",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE_URL}/city/${c.slug}` },
              { "@type": "ListItem", position: 3, name: `${c.name}, ${c.state}`, item: `${SITE_URL}${path}` },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-extrabold">City not found</h1>
      <p className="mt-3 text-muted-foreground">We don't have a page for that city yet.</p>
      <Link to="/contact" className="mt-6 inline-block font-bold text-primary hover:underline">
        Ask about your area →
      </Link>
    </div>
  ),
  component: CityPage,
});

function CityPage() {
  const { city } = Route.useLoaderData();
  const offered = city.services as string[]
    .map((slug: string) => serviceBySlug(slug))
    .filter((s: ReturnType<typeof serviceBySlug>): s is NonNullable<ReturnType<typeof serviceBySlug>> => Boolean(s));
  const otherCities = cities.filter((c) => c.slug !== city.slug);

  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Service Areas</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">{city.name}, {city.state}</span>
          </nav>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <MapPin className="h-3.5 w-3.5" /> {city.region}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-5xl">
            Lawn Care in {city.name}, {city.state}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{city.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:-translate-y-0.5 transition-transform"
            >
              Get a free quote
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-bold text-foreground hover:bg-accent"
            >
              See all services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-heading text-2xl font-extrabold md:text-3xl">Services we offer in {city.name}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {offered.map((s: NonNullable<ReturnType<typeof serviceBySlug>>) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <h3 className="font-heading text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-accent/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading text-2xl font-extrabold md:text-3xl">Neighborhoods we cover</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-foreground md:grid-cols-3">
            {city.neighborhoods.map((n: string) => (
              <li key={n} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-heading text-2xl font-extrabold md:text-3xl">
          {city.name} lawn care FAQs
        </h2>
        <dl className="mt-6 space-y-6">
          {city.faqs.map((f: { q: string; a: string }) => (
            <div key={f.q} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <dt className="font-heading text-lg font-bold text-foreground">{f.q}</dt>
              <dd className="mt-2 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PartnerCallout />

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-heading text-2xl font-extrabold">Other cities we serve</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherCities.map((c) => (
            <Link
              key={c.slug}
              to="/city/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary/40 hover:text-primary"
            >
              {c.name}, {c.state}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
