export const site = {
  name: "ProMows",
  tagline: "Professional Lawn & Landscape Care",
  domain: "promows.com",
  email: "info@promows.com",
  serviceArea: "North America",
  locale: "en_US",
  partner: {
    name: "PlowWow",
    domain: "plowwow.com",
    url: "https://plowwow.com",
    tagline: "Snow removal & winter services",
  },
} as const;

// Absolute URLs used in JSON-LD, og:image and twitter:image.
// Crawlers require absolute image URLs.
export const SITE_URL = `https://${site.domain}`;
export const LOGO_URL = `${SITE_URL}/android-chrome-512x512.png`;
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

/**
 * Build canonical + hreflang link tags for a route.
 * ProMows is currently single-locale (en-US). Both self-referencing
 * hreflang tags (`en` and `x-default`) point to the same absolute URL so
 * search engines don't treat any variant as a duplicate.
 */
export const seoLinks = (path: string) => {
  const href = `${SITE_URL}${path}`;
  return [
    { rel: "canonical", href },
    { rel: "alternate", hrefLang: "en", href },
    { rel: "alternate", hrefLang: "x-default", href },
  ];
};

export type ServiceSlug =
  | "mowing"
  | "landscape-design"
  | "hedge-tree-trimming"
  | "yard-cleanup"
  | "fertilization"
  | "seasonal-cleanups";

export interface Service {
  slug: ServiceSlug;
  title: string;
  short: string;
  description: string;
  bullets: string[];
  icon: string; // lucide icon name
}

export const services: Service[] = [
  {
    slug: "mowing",
    title: "Lawn Mowing",
    short: "Weekly and bi-weekly mowing that keeps your lawn crisp all season.",
    description:
      "Sharp blades, clean edges, and consistent cut heights tuned to your grass type. Our crews show up on schedule, mow, edge, trim, and blow off every hard surface before we leave.",
    bullets: [
      "Weekly or bi-weekly service plans",
      "Blade sharpening every 8 hours of run time",
      "Edging along walks, drives, and beds",
      "Full cleanup — no clippings left behind",
    ],
    icon: "Scissors",
  },
  {
    slug: "landscape-design",
    title: "Landscape Design & Install",
    short: "Beds, borders, plantings, and hardscape that lift the whole yard.",
    description:
      "From a single new bed to a full front-yard reset. We plan, source, and install plantings, mulch, edging, and stone that fit your climate zone and how you actually use the space.",
    bullets: [
      "Site walk and concept sketch included",
      "Native and climate-appropriate plantings",
      "Bed prep, mulch, and edging",
      "Small hardscape (steppers, borders, gravel)",
    ],
    icon: "Sprout",
  },
  {
    slug: "hedge-tree-trimming",
    title: "Hedge & Tree Trimming",
    short: "Shape hedges, prune small trees, and clear overgrowth safely.",
    description:
      "Trained crews with proper PPE and clean cuts. We shape hedges, prune small ornamental trees, and clear brush without shocking the plant or scarring the trunk.",
    bullets: [
      "Formative and maintenance pruning",
      "Hedge shaping to a consistent line",
      "Small tree work (under 20 ft)",
      "All debris hauled off site",
    ],
    icon: "TreePine",
  },
  {
    slug: "yard-cleanup",
    title: "Yard Cleanup",
    short: "One-time cleanups for leaves, brush, storm debris, and overgrowth.",
    description:
      "Perfect after a storm, at the end of the season, or when a rental turns over. We clear, rake, blow, bag, and haul — leaving the yard camera-ready.",
    bullets: [
      "Leaf and debris removal",
      "Storm and wind cleanup",
      "Overgrowth cutback",
      "Haul-away included",
    ],
    icon: "Leaf",
  },
  {
    slug: "fertilization",
    title: "Fertilization & Weed Control",
    short: "Season-long programs that thicken turf and choke out weeds.",
    description:
      "A 4- to 6-visit annual program calibrated to your grass type, soil, and region. Balanced fertilizer, pre-emergent weed control, and spot treatments for problem areas.",
    bullets: [
      "Custom program by region",
      "Pre-emergent weed control",
      "Grub and insect spot treatment",
      "Soil-safe products",
    ],
    icon: "Droplets",
  },
  {
    slug: "seasonal-cleanups",
    title: "Spring & Fall Cleanups",
    short: "Open the yard in spring, close it out in fall — one flat price.",
    description:
      "Spring: dethatch, edge, mulch refresh, first mow. Fall: leaf haul, bed cutback, final mow, and winter prep. Flat-priced so there are no surprises.",
    bullets: [
      "Spring turf wake-up",
      "Mulch and bed refresh",
      "Fall leaf haul",
      "Winter-ready cutback",
    ],
    icon: "CalendarDays",
  },
];

export const serviceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);
