export interface CityFaq {
  q: string;
  a: string;
}

export interface City {
  slug: string;
  name: string;
  state: string; // 2-letter
  region: string;
  intro: string;
  neighborhoods: string[];
  services: string[]; // service slugs offered here
  faqs: CityFaq[];
  updatedAt: string; // ISO date
}

export const cities: City[] = [
  {
    slug: "austin-tx",
    name: "Austin",
    state: "TX",
    region: "Central Texas",
    intro:
      "ProMows serves homeowners and property managers across Austin — from Zilker and Barton Hills to Mueller and Round Rock. We tune every mow, cleanup, and fertilization plan to the Central Texas climate, so your lawn stays green through the heat and bounces back after every dry spell.",
    neighborhoods: ["Zilker", "Barton Hills", "Mueller", "Hyde Park", "Round Rock", "Cedar Park"],
    services: ["mowing", "fertilization", "landscape-design", "yard-cleanup"],
    faqs: [
      {
        q: "How often should my Austin lawn be mowed?",
        a: "Weekly from April through October, bi-weekly in the cooler months. St. Augustine and Bermuda both grow fast here and benefit from a consistent cut height.",
      },
      {
        q: "Do you handle drought-tolerant landscaping?",
        a: "Yes — native Texas plantings, xeriscape beds, and drip irrigation prep are all part of our Austin landscape design work.",
      },
      {
        q: "What ZIP codes do you cover in Austin?",
        a: "Most Austin metro ZIP codes including 78701, 78704, 78745, 78751, and Round Rock 78664. Send us your address for a same-day check.",
      },
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "denver-co",
    name: "Denver",
    state: "CO",
    region: "Front Range",
    intro:
      "Front Range lawns take a beating — thin soils, dry air, and sudden hail. ProMows crews in Denver mow, aerate, and fertilize on schedules built for Kentucky Bluegrass and Tall Fescue, and our partner PlowWow handles snow so your driveway is clear before you leave for work.",
    neighborhoods: ["Wash Park", "Cherry Creek", "Highlands", "Stapleton", "Aurora", "Lakewood"],
    services: ["mowing", "fertilization", "seasonal-cleanups", "hedge-tree-trimming"],
    faqs: [
      {
        q: "When should I start lawn care in Denver?",
        a: "Mid-April, once the last hard frost passes. Spring cleanup and a first fertilization pass set the tone for the whole season.",
      },
      {
        q: "Do you coordinate snow removal with PlowWow?",
        a: "Yes — sign up for winter service and PlowWow handles driveways, walks, and salt on the same address we mow all summer.",
      },
      {
        q: "Do you aerate lawns in Denver?",
        a: "Every fall. Core aeration relieves the compaction our clay soils build up and helps water reach the root zone.",
      },
    ],
    updatedAt: "2026-07-05",
  },
  {
    slug: "minneapolis-mn",
    name: "Minneapolis",
    state: "MN",
    region: "Twin Cities",
    intro:
      "ProMows keeps Twin Cities lawns tight from the first spring cleanup through the final fall leaf haul. We work Minneapolis, St. Paul, and the western suburbs — and our partner PlowWow takes over the driveway in November.",
    neighborhoods: ["Uptown", "Linden Hills", "Northeast", "Edina", "St. Paul", "Minnetonka"],
    services: ["mowing", "seasonal-cleanups", "fertilization", "yard-cleanup"],
    faqs: [
      {
        q: "How do you handle fall leaf cleanup?",
        a: "Two-pass service: mid-October and late-November. We mulch, bag, and haul — nothing left on the lawn under the snow.",
      },
      {
        q: "Do you offer year-round property care?",
        a: "Lawn and landscape from ProMows April–November, snow and ice from PlowWow December–March. Same address, one point of contact.",
      },
      {
        q: "What grass types do you fertilize?",
        a: "Kentucky Bluegrass, Fine Fescue, and Perennial Rye mixes typical of Minneapolis lawns. Programs are tuned by soil test on request.",
      },
    ],
    updatedAt: "2026-07-10",
  },
  {
    slug: "raleigh-nc",
    name: "Raleigh",
    state: "NC",
    region: "Research Triangle",
    intro:
      "Raleigh lawns run on warm-season grasses — Bermuda, Zoysia, and Centipede. ProMows crews across the Triangle mow, edge, and fertilize on schedules that keep those lawns dense, green, and weed-free from March through October.",
    neighborhoods: ["North Hills", "Five Points", "Cameron Village", "Cary", "Apex", "Durham"],
    services: ["mowing", "fertilization", "hedge-tree-trimming", "landscape-design"],
    faqs: [
      {
        q: "When does mowing season start in Raleigh?",
        a: "Late March once soil warms above 60°F. Bermuda greens up first, Zoysia a few weeks later.",
      },
      {
        q: "Do you do landscape design in the Triangle?",
        a: "Yes — bed refresh, native plantings, and mulch install across Raleigh, Cary, and Durham.",
      },
      {
        q: "Do you treat for crabgrass?",
        a: "Pre-emergent goes down in February and April as part of our standard fertilization program.",
      },
    ],
    updatedAt: "2026-07-12",
  },
];

export const cityBySlug = (slug: string): City | undefined =>
  cities.find((c) => c.slug === slug);
