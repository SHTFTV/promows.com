import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { site, SITE_URL, OG_IMAGE_URL, seoLinks } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ProMows — Free Lawn & Landscape Quotes" },
      {
        name: "description",
        content:
          "Request a free lawn or landscape quote from ProMows. Serving homeowners and property managers across North America. Response within 24 hours.",
      },
      { property: "og:title", content: "Contact ProMows" },
      { property: "og:description", content: "Free lawn & landscape quotes. Response within 24 hours." },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:title", content: "Contact ProMows" },
      { name: "twitter:description", content: "Free lawn & landscape quotes. Response within 24 hours." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/contact"),
  }),

  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">Get a free quote</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell us about your yard. We'll come back with a flat price within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[2fr_1fr]">
        <form
          className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks! We'll be in touch within 24 hours.");
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Name</span>
              <input required name="name" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Email</span>
              <input required type="email" name="email" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Phone</span>
              <input name="phone" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Address / City</span>
              <input required name="address" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            <span className="font-semibold">What do you need?</span>
            <textarea
              name="message"
              rows={5}
              placeholder="e.g. weekly mowing for a 5,000 sq ft yard, plus spring cleanup"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Send request
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            We never sell your info. Snow-service requests are forwarded to our partner PlowWow.
          </p>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold">Direct</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="hover:underline">{site.phone}</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {site.serviceArea}</li>
            </ul>
          </div>
        </aside>
      </section>

      <PartnerCallout />
    </>
  );
}
