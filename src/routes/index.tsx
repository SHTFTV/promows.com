import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
import { services, site, SITE_URL, LOGO_URL, OG_IMAGE_URL, seoLinks } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";
import { FoundingModal } from "@/components/site/FoundingModal";
import { posts } from "@/data/blog";
import { YardHeroSequence } from "@/components/site/YardHeroSequence";
import logoHex from "@/assets/promows-logo-hex-transparent.png";


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
      { property: "og:image:alt", content: "ProMows lawn care — life outside, looking its best" },
      {property:"og:image:width",content:"1200"},{property:"og:image:height",content:"630"},{property:"og:image:type",content:"image/jpeg"},
      { name: "twitter:title", content: "ProMows — Lawn & Landscape Care" },
      { name: "twitter:description", content: "Sharp lawns, thoughtful landscapes, honest crews across North America." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/"),
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
          email: site.email,
          areaServed: site.serviceArea,
          priceRange: "$$",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "How does founding pricing work?", acceptedAnswer: { "@type": "Answer", text: "Founding pricing starts at $10/month per household, exclusive to one home per block. Your rate is locked for as long as you stay on service." } },
            { "@type": "Question", name: "What areas are opening first?", acceptedAnswer: { "@type": "Answer", text: "We open neighborhoods by demand — high-signup ZIP codes in Colorado, Texas, and the Midwest are first in line for spring routes." } },
            { "@type": "Question", name: "How do you select the pros who service my street?", acceptedAnswer: { "@type": "Answer", text: "Every applicant is vetted for insurance, equipment, past work photos, and references. Homeowners rate every job and low-rated pros lose the route." } },
            { "@type": "Question", name: "Is there a contract or auto-renew?", acceptedAnswer: { "@type": "Answer", text: "No contract and no auto-enroll. Pause or cancel anytime; founding pricing resumes when you come back." } },
            { "@type": "Question", name: "What if my block already has a founding member?", acceptedAnswer: { "@type": "Answer", text: "You'll join the waitlist for that block and get standard ProMows pricing when service starts in your area." } },
          ],
        }),
      },
    ],
  }),

  component: HomePage,
});

function HomePage() {
  const [foundingOpen, setFoundingOpen] = useState(false);
  return (
    <>
      <section className="pm-hero" aria-labelledby="pm-heading">
        <YardHeroSequence />
        <div className="pm-hero-shade" />
        <div className="pm-hero-content">
          <img className="pm-hero-logo" src={logoHex} alt="ProMows Lawn Care" />
          <p className="pm-eyebrow">A little care. A lot of curb appeal.</p>
          <h1 id="pm-heading">Life outside.<br /><span>Looking its best.</span></h1>
          <p>Mowing, fresh edges and seasonal cleanups. Tell us what your property needs and let’s plan the next step.</p>
          <div className="pm-actions"><Link to="/contact" className="pm-primary">Plan your lawn care <ArrowRight size={18}/></Link><Link to="/services">Explore services →</Link></div>
        </div>
        <p className="pm-credit">ProMows truck concept, followed by stock yard footage: <a href="https://www.pexels.com/video/aerial-view-of-lawn-mowing-in-springtime-32388310/">Ahmet Kurt</a> and <a href="https://www.pexels.com/video/an-aerial-view-of-a-garden-with-a-walkway-27729864/">David Pickup / Pexels</a>. Not confirmed ProMows projects.</p>
      </section>
      <aside className="pm-enquiry" aria-label="ProMows project enquiries">
        <details><summary><img src={logoHex} alt=""/><span>Let’s talk lawn care<small>ProMows project enquiries</small></span><span aria-hidden>+</span></summary>
          <div className="pm-enquiry-body"><p>Your lawn. Your plans. Start with your city, property type and the work you have in mind.</p><a className="pm-primary" href={`mailto:${site.email}?subject=ProMows%20property%20enquiry`}>Email ProMows →</a><a href={`mailto:${site.email}`}>{site.email}</a><small>Service availability, scope and pricing are confirmed directly. Email opens a draft for you to send.</small></div>
        </details>
      </aside>
      {/* FOUNDING NEIGHBORHOOD OFFER */}
      <section className="border-y border-primary/20 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-background/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-background/30">
              Founding offer
            </span>
            <div>
              <h2 className="font-heading text-2xl font-extrabold md:text-3xl">
                Claim your neighborhood from just $10/month
              </h2>
              <p className="mt-1 text-sm opacity-90 md:text-base">
                <a href="#founding-faq" className="font-semibold underline decoration-2 underline-offset-2 hover:opacity-100">
                  Exclusive Territories
                </a>{" "}
                — Reliable crews, solo operators, and landscape pros — bring your standards, we'll bring the routes and steady work.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFoundingOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Join &amp; claim my block <ArrowRight className="h-4 w-4" />
          </button>
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

      <section className="pm-journal" aria-labelledby="pm-journal-title"><div className="pm-journal-head"><div><p className="pm-eyebrow">Notes from the growing season</p><h2 id="pm-journal-title">A better-looking yard starts here.</h2><p>Latest article published: {new Date(Math.max(...posts.map(p => Date.parse(p.publishedAt)))).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</p></div><Link to="/blog">All lawn care articles →</Link></div><div className="pm-journal-grid">{[...posts].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,4).map((post,i)=><article key={post.slug}><div className={`pm-topic pm-topic-${i}`} aria-label={post.tags.join(', ')}>{["✂","❧","☀","♧"][i]}<span>{post.tags[0]}</span></div><div className="pm-journal-copy"><time dateTime={post.publishedAt}>{new Date(post.publishedAt+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time><h3><Link to="/blog/$slug" params={{slug:post.slug}}>{post.title}</Link></h3><p>{post.excerpt}</p><Link to="/blog/$slug" params={{slug:post.slug}}>Read the guide →</Link></div></article>)}</div><small>Topic illustrations are editorial graphics, not project photographs.</small></section>
      <PartnerCallout />

      {/* FAQ */}
      <section id="founding-faq" className="mx-auto max-w-4xl px-4 py-20" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-heading text-3xl font-extrabold md:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-muted-foreground">Founding pricing, service areas, and how we pick pros.</p>
        <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {[
            {
              q: "How does founding pricing work?",
              a: "Founding pricing starts at $10/month per household and is exclusive to one home per block. Once your neighborhood opens, we lock your rate in for as long as you stay on service — future price changes never touch founding members.",
            },
            {
              q: "What areas are opening first?",
              a: "We're opening neighborhoods by demand. High-signup ZIP codes in Colorado, Texas, and the Midwest are first in line for spring routes; every other market rolls out as we hit crew capacity. Drop your address to move your block up the list.",
            },
            {
              q: "How do you select the pros who service my street?",
              a: "Every applicant is vetted for insurance, equipment quality, past work photos, and neighborhood references. We ride along on the first two visits, and homeowners rate every job. Pros who drop below 4.7★ or miss schedules lose the route.",
            },
            {
              q: "Is there a contract or auto-renew?",
              a: "No contract, no auto-enroll. You can pause or cancel any time. Founding pricing simply resumes when you come back the following season.",
            },
            {
              q: "What if my block already has a founding member?",
              a: "We'll add you to the waitlist for that block and notify you the moment a spot opens. In the meantime, you'll still get standard ProMows pricing when service starts in your area.",
            },
          ].map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-semibold text-foreground marker:hidden hover:bg-accent/30">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
              </summary>
              <div className="px-6 pb-5 text-muted-foreground">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

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

      <FoundingModal open={foundingOpen} onClose={() => setFoundingOpen(false)} />
    </>
  );
}

