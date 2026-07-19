import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Repeat, Shield, Snowflake, Users } from "lucide-react";
import { site, SITE_URL, OG_IMAGE_URL } from "@/data/site";
import heroVideo from "@/assets/promows-hero.mp4.asset.json";
import truckAsset from "@/assets/promows-truck.png.asset.json";


export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — ProMows & PlowWow, Year-Round Property Care" },
      {
        name: "description",
        content:
          "ProMows partners with PlowWow to give homeowners and property managers one team, year-round: lawn and landscape spring through fall, snow removal and winter services when the season turns.",
      },
      { property: "og:title", content: "ProMows Partners" },
      { property: "og:description", content: "One team, year-round. ProMows for lawn care. PlowWow for snow." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/partners` },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:title", content: "ProMows & PlowWow — Year-Round Property Care" },
      { name: "twitter:description", content: "Lawn care by ProMows. Snow removal by PlowWow. One team, all year." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/partners"),

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "ProMows Partners",
          url: `https://${site.domain}/partners`,
          mainEntity: {
            "@type": "Organization",
            name: "PlowWow",
            url: site.partner.url,
            description: "Snow removal and winter services partner of ProMows.",
          },
        }),
      },
    ],
  }),
  component: Partners,
});

function Partners() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <video
          src={heroVideo.url}
          poster={truckAsset.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--partner)]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--partner)]">
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden /> Partnership
          </span>

          <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-5xl">
            ProMows &amp; PlowWow — one team, all four seasons.
          </h1>
          <p className="mt-4 text-lg text-background/80">
            Your property has two jobs: keep it green in the growing months and keep it safe when
            the snow flies. ProMows handles the first. PlowWow handles the second. Same standards.
            Same insurance requirements. One less company to vet.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={site.partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--partner)] px-5 py-3 font-bold text-[color:var(--partner-foreground)] transition-transform hover:-translate-y-0.5"
            >
              Visit PlowWow.com <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 font-bold text-foreground hover:bg-accent"
            >
              Bundle lawn + snow →
            </Link>
          </div>
        </div>
      </section>

      {/* Two-column brand blocks */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="font-heading text-2xl font-bold">ProMows</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Weekly mowing, landscape design, hedge and tree trimming, cleanups, and
              fertilization. Serving homeowners and property managers across {site.serviceArea}{" "}
              spring through fall.
            </p>
            <Link to="/services" className="mt-4 inline-flex items-center gap-1 font-bold text-primary hover:underline">
              See our services <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-2xl border border-[color:var(--partner)]/30 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--partner)] text-[color:var(--partner-foreground)]">
                <Snowflake className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="font-heading text-2xl font-bold">PlowWow</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Snow plowing, sidewalk clearing, de-icing, and full winter maintenance for
              residential and commercial properties. Trained crews with the same on-time and
              cleanup standards as ProMows.
            </p>
            <a
              href={site.partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 font-bold text-[color:var(--partner)] hover:underline"
            >
              Visit plowwow.com <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </div>

        {/* Why partner */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { i: Shield, t: "Same standards", d: "Insurance, background checks, on-time visits, and clean-finish work — matched between both companies." },
            { i: Repeat, t: "One handoff", d: "When the season turns, we transfer your account details so PlowWow shows up ready." },
            { i: HeartHandshake, t: "One relationship", d: "You never have to shop for a snow provider — or a lawn provider — again." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl bg-accent/30 p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <v.i className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For landscapers CTA */}
      <section className="bg-[color:var(--footer-bg)] text-[color:var(--footer-foreground)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-heading text-3xl font-extrabold">Landscaper or snow contractor?</h2>
            <p className="mt-3 max-w-2xl opacity-90">
              We're always looking to add trained crews to the ProMows + PlowWow network. If you
              run a landscaping or snow business and want year-round leads, let's talk.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 justify-self-start rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 md:justify-self-end"
          >
            Apply to the network <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
