import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Droplets,
  Leaf,
  Scissors,
  Sprout,
  Star,
  TreePine,
} from "lucide-react";
import { services, site, SITE_URL, LOGO_URL, OG_IMAGE_URL } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";
import truckAsset from "@/assets/promows-truck.png.asset.json";


const iconMap = {
  Scissors,
  Sprout,
  TreePine,
  Leaf,
  Droplets,
  CalendarDays,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProMows — Professional Lawn & Landscape Care Across North America" },
      {
        name: "description",
        content:
          "Reliable weekly mowing, landscape design, hedge and tree trimming, cleanups, and fertilization. Serving homeowners and property managers across North America. Winter services by our partner PlowWow.",
      },
      { property: "og:title", content: "ProMows — Lawn & Landscape Care" },
      { property: "og:description", content: "Sharp lawns, thoughtful landscapes, honest crews. Year-round property care across North America." },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:alt", content: "ProMows Lawn Care" },
      { name: "twitter:title", content: "ProMows — Lawn & Landscape Care" },
      { name: "twitter:description", content: "Sharp lawns, thoughtful landscapes, honest crews across North America." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}/#business`,
          name: site.name,
          url: SITE_URL,
          logo: LOGO_URL,
          image: OG_IMAGE_URL,
          telephone: site.phone,
          email: site.email,
          areaServed: site.serviceArea,
          priceRange: "$$",
        }),
      },
    ],
  }),

  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/40 via-background to-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Leaf className="h-3.5 w-3.5" aria-hidden /> {site.tagline}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
              Sharp lawns.<br />Thoughtful landscapes.<br />
              <span className="text-primary">Honest crews.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              ProMows is your year-round lawn and landscape crew across {site.serviceArea}.
              Weekly mowing, seasonal cleanups, landscape design, and fertilization — all on
              schedule, all cleaned up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get a free quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-bold text-foreground hover:bg-accent"
              >
                See services
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {["On-schedule crews", "Fully insured", "Flat pricing"].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" aria-hidden />
            <img
              src={truckAsset.url}
              alt="ProMows lawn care truck with green grass wrap"
              className="relative w-full max-w-xl drop-shadow-2xl"
              width={1024}
              height={1024}
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute bottom-2 left-2 grid grid-cols-2 gap-3 text-sm md:left-6">
              <div className="rounded-xl bg-background/90 p-3 shadow-lg backdrop-blur">
                <div className="text-2xl font-extrabold text-primary">4.9★</div>
                <div className="text-xs text-muted-foreground">Avg. rating</div>
              </div>
              <div className="rounded-xl bg-background/90 p-3 shadow-lg backdrop-blur">
                <div className="text-2xl font-extrabold text-primary">98%</div>
                <div className="text-xs text-muted-foreground">On-time visits</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-20" aria-labelledby="home-services">
        <div className="mb-10 max-w-2xl">
          <h2 id="home-services" className="font-heading text-3xl font-extrabold md:text-4xl">
            What we do
          </h2>
          <p className="mt-3 text-muted-foreground">
            One crew for the whole growing season. Pick a plan or mix and match.
          </p>
        </div>
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
                <h3 className="mt-4 font-heading text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-accent/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-heading text-3xl font-extrabold md:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Tell us about your yard", d: "Send a photo or address. We quote in 24 hours." },
              { n: "2", t: "Pick a plan", d: "Weekly, bi-weekly, or one-time. Flat pricing, no surprises." },
              { n: "3", t: "We show up on schedule", d: "Same crew, same day of the week. Clean finish every visit." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-background p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-extrabold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-20" aria-labelledby="home-reviews">
        <h2 id="home-reviews" className="font-heading text-3xl font-extrabold md:text-4xl">
          Homeowners keep us on the schedule
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { q: "Best lawn on the block for the first time ever. Crew is fast and tidy.", n: "Marissa T." },
            { q: "Signed up for weekly mowing plus spring cleanup — pricing is flat, no surprises.", n: "Devon R." },
            { q: "They also connected us to PlowWow for snow. One less thing to shop for.", n: "Angela K." },
          ].map((r, i) => (
            <figure key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-3 text-foreground">"{r.q}"</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-muted-foreground">— {r.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <PartnerCallout />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-3xl font-extrabold md:text-4xl">
                Ready for a sharper yard?
              </h2>
              <p className="mt-3 max-w-2xl opacity-90">
                Free quotes in 24 hours. No pressure, no auto-enroll — just a clear price and a
                real schedule.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 justify-self-start rounded-lg bg-background px-6 py-3 font-bold text-primary shadow-sm transition-transform hover:-translate-y-0.5 md:justify-self-end"
            >
              Get my free quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
