import { Link } from "@tanstack/react-router";
import { Leaf, Mail, Phone, Snowflake } from "lucide-react";
import { services, site } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[color:var(--footer-bg)] text-[color:var(--footer-foreground)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" aria-hidden />
            </span>
            ProMows
          </Link>
          <p className="mt-3 text-sm opacity-80">
            {site.tagline}. Serving homeowners and property managers across {site.serviceArea}.
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" aria-hidden /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:underline">
              <Mail className="h-4 w-4" aria-hidden /> {site.email}
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to="/services/$slug" params={{ slug: s.slug }} className="opacity-80 hover:opacity-100 hover:underline">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="opacity-80 hover:opacity-100 hover:underline">About</Link></li>
            <li><Link to="/services" className="opacity-80 hover:opacity-100 hover:underline">All services</Link></li>
            <li><Link to="/blog" className="opacity-80 hover:opacity-100 hover:underline">Blog</Link></li>
            <li><Link to="/partners" className="opacity-80 hover:opacity-100 hover:underline">Partners</Link></li>
            <li><Link to="/contact" className="opacity-80 hover:opacity-100 hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Winter Partner</h3>
          <a
            href={site.partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl bg-[color:var(--partner)] p-4 text-[color:var(--partner-foreground)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 font-heading text-lg font-extrabold">
              <Snowflake className="h-5 w-5" aria-hidden /> PlowWow
            </div>
            <p className="mt-1 text-sm opacity-90">
              Snow removal, salting, and winter services. When the season turns, we hand you off to PlowWow.
            </p>
            <span className="mt-3 inline-block text-sm font-bold underline underline-offset-4 group-hover:no-underline">
              Visit plowwow.com →
            </span>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-80 md:flex-row">
          <p>© {year} ProMows. All rights reserved.</p>
          <p>
            Partnered with{" "}
            <a href={site.partner.url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">
              PlowWow
            </a>{" "}
            for winter services.
          </p>
        </div>
      </div>
    </footer>
  );
}
