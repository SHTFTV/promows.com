import { Link } from "@tanstack/react-router";
import { Menu, Phone, Snowflake, X } from "lucide-react";
import { useState } from "react";
import { site } from "@/data/site";
import logoAsset from "@/assets/promows-logo.png.asset.json";


const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/partners", label: "Partners" },
  { to: "/pros", label: "Pros" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* Top strip: PlowWow partner cross-link, always visible */}
      <div className="bg-[color:var(--topbar-bg)] text-[color:var(--topbar-foreground)] text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 hover:opacity-80">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            <span>{site.phone}</span>
          </a>
          <a
            href={site.partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--partner)] px-3 py-1 font-semibold text-[color:var(--partner-foreground)] hover:opacity-90"
          >
            <Snowflake className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Need snow removal? Visit our partner </span>
            <span className="sm:hidden">Snow? </span>
            <span>PlowWow →</span>
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <img
            src={logoAsset.url}
            alt="ProMows Lawn Care logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-contain"
          />
          <span className="sr-only">ProMows</span>
          <span aria-hidden>
            Pro<span className="text-primary">Mows</span>
          </span>
        </Link>


        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:text-primary"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground"
            >
              Get a Quote
            </Link>
            <a
              href={site.partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-md bg-[color:var(--partner)] px-4 py-2 text-center text-sm font-bold text-[color:var(--partner-foreground)]"
            >
              Snow? Visit PlowWow →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
