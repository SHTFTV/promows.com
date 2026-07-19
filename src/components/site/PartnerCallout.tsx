import { Snowflake, ArrowRight } from "lucide-react";
import { site } from "@/data/site";

export function PartnerCallout({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby="partner-callout-heading"
      className="relative overflow-hidden bg-[color:var(--partner)] text-[color:var(--partner-foreground)]"
    >
      <div className={`mx-auto max-w-7xl px-4 ${compact ? "py-10" : "py-16"}`}>
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Snowflake className="h-3.5 w-3.5" aria-hidden /> Winter Partner
            </div>
            <h2 id="partner-callout-heading" className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
              When the snow falls, call PlowWow.
            </h2>
            <p className="mt-3 max-w-2xl text-base opacity-90 md:text-lg">
              ProMows keeps your property sharp spring through fall. Our partner{" "}
              <strong>PlowWow</strong> handles snow removal, de-icing, and winter maintenance so
              your property is covered year-round — one relationship, two seasons.
            </p>
          </div>
          <a
            href={site.partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 justify-self-start rounded-lg bg-white px-5 py-3 font-bold text-[color:var(--partner)] shadow-sm transition-transform hover:-translate-y-0.5 md:justify-self-end"
          >
            Visit PlowWow.com <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
