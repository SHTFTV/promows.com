
# ProMows Phase 2 — Admin, Content, Locations, Quote Flow

Large scope. Breaking into 4 shippable chunks so you can review as I go. I'll build them in order in this turn unless you redirect.

## 1. Lovable Cloud + Auth + RBAC
- Enable Lovable Cloud (Supabase under the hood).
- Tables: `profiles`, `user_roles` (enum: admin, editor, viewer), `cities`, `blog_posts`, `quotes`, `takeoffs`.
- RLS: public SELECT on published cities/posts; admin/editor write via `has_role()` security-definer fn; owner-only on quotes/takeoffs.
- `/auth` sign-in (email/password + Google), `_authenticated/` gate (managed), `_authenticated/admin/*` for role-gated CMS.
- Admin UI: list/create/edit cities, list/create/edit blog posts (markdown body, slug, seo fields, faq JSON, hero image URL).

## 2. Blog
- `/blog` index — server fn lists published posts, SEO head, ItemList JSON-LD.
- `/blog/$slug` — server fn fetches post, per-page `<title>`, description, canonical, og:image (hero), Article + BreadcrumbList JSON-LD server-rendered.
- Markdown rendering (react-markdown).

## 3. City pages
- `/city/$slug` — server fn fetches city row: name, state, hero, intro, services offered, FAQs, testimonials.
- SEO: unique title/desc/canonical/og, LocalBusiness + BreadcrumbList + FAQPage JSON-LD server-rendered.
- Sitemap updated to include all published cities + posts.

## 4. Quote + Takeoff flow
- `/quote` — multi-step form (property type, lot size, services, frequency, contact). Server fn calculates estimated price range (simple rules-based: base × sqft × frequency multiplier + service add-ons) and inserts a `quotes` row.
- `/quote/result/$id` — shows estimate, SEO metadata (noindex — private).
- `/takeoff` — pro-facing measurement calculator (area × unit cost per service, mowing/mulch/edging), server-side calc, saves `takeoffs` row.
- `/takeoff/result/$id` — results page, noindex.

## Technical notes
- All content reads via `createServerFn` with publishable-key server client for public data (narrow `TO anon` SELECT).
- Admin mutations via `requireSupabaseAuth` + `has_role('admin'|'editor')` check.
- Head metadata driven by loader data on every dynamic route; no home-page fallback.
- Seed one demo city + one demo blog post in migration so routes render immediately.

## Confirm
- **Google sign-in for admins?** (default: email/password only — you can invite yourself, simpler.)
- **Quote/takeoff pricing** — I'll use placeholder rates ($ per sqft) you can tune later in `src/data/pricing.ts`. OK?
- **Blog editor** — plain markdown textarea (fast) vs. rich text (slower, more deps). Default: markdown.

Reply "go" to build all 4 with those defaults, or adjust.
