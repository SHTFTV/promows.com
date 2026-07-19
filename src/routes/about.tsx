import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, Leaf, ShieldCheck, Users } from "lucide-react";
import { site, SITE_URL, OG_IMAGE_URL } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ProMows — Lawn & Landscape Care You Can Count On" },
      {
        name: "description",
        content:
          "ProMows is a network of professional lawn and landscape crews serving North America. Same-crew consistency, flat pricing, and a year-round partnership with PlowWow for winter services.",
      },
      { property: "og:title", content: "About ProMows" },
      { property: "og:description", content: "Same-crew consistency, flat pricing, and year-round property care across North America." },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:title", content: "About ProMows" },
      { name: "twitter:description", content: "Same-crew consistency, flat pricing, year-round property care." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/about"),
  }),

  component: About,
});

function About() {
  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Leaf className="h-3.5 w-3.5" aria-hidden /> About ProMows
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-5xl">
            A crew that treats your yard like their own.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            ProMows started because good lawn care shouldn't be a coin flip. We built a network of
            trained crews across {site.serviceArea} who follow the same standards, pricing, and
            cleanup checklist on every visit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Users, t: "Same crew, every week", d: "You get to know the faces. They get to know your yard." },
            { i: ShieldCheck, t: "Fully insured", d: "Liability and workers' comp on every crew, every visit." },
            { i: Award, t: "Flat pricing", d: "No surprise line-items. What we quote is what you pay." },
            { i: HeartHandshake, t: "Year-round partner", d: "PlowWow handles snow so you don't have to shop twice." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <v.i className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="prose prose-lg max-w-none">
          <h2 className="font-heading text-3xl font-extrabold">Why we partnered with PlowWow</h2>
          <p>
            Lawn care and snow removal are the same job with different weather. Homeowners
            shouldn't have to source, vet, and re-onboard a new company every October. ProMows
            covers the growing season; <a href={site.partner.url} target="_blank" rel="noopener noreferrer">PlowWow</a> covers
            the winter. Same standards, same insurance requirements, same commitment to showing up
            on time.
          </p>
          <p>
            If you're a landscaper reading this — we'd love to talk. Head to our{" "}
            <Link to="/partners">partners page</Link>.
          </p>
        </div>
      </section>

      <PartnerCallout />
    </>
  );
}
