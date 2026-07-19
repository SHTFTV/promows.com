export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Paragraphs of body copy (plain text, one per array item). */
  body: string[];
  author: string;
  publishedAt: string; // ISO date
  updatedAt: string; // ISO date
  tags: string[];
  readMinutes: number;
}

export const posts: BlogPost[] = [
  {
    slug: "how-often-should-you-mow",
    title: "How often should you mow? A season-by-season guide",
    excerpt:
      "Mowing frequency isn't a fixed schedule — it flexes with grass type, rainfall, and the calendar. Here's how ProMows crews decide.",
    body: [
      "Every lawn has a rhythm, and mowing too often (or too rarely) throws it off. The one-third rule still holds: never cut more than a third of the blade in a single pass. From there, frequency is a function of grass type, rainfall, and time of year.",
      "In peak growth — May through July for cool-season lawns, June through September for warm-season — weekly mowing is standard. Skip a week and you'll scalp the lawn trying to catch up, which stresses the roots and invites weeds.",
      "Shoulder seasons (April, October) usually flex to every 10 days. Once growth slows in late fall, a final short cut before dormancy prevents matting under leaves and snow.",
      "The fastest way to know: watch the blade length, not the calendar. If the tips are above your target height by more than a third, it's time to mow.",
    ],
    author: "ProMows Crew",
    publishedAt: "2026-05-12",
    updatedAt: "2026-05-12",
    tags: ["Mowing", "Lawn care"],
    readMinutes: 4,
  },
  {
    slug: "fall-cleanup-checklist",
    title: "The ProMows fall cleanup checklist",
    excerpt:
      "Ten things every homeowner should do before the first hard freeze — from leaf haul to winter irrigation shut-off.",
    body: [
      "Fall is when smart lawn owners set up next spring. Do these ten things and April looks a lot better.",
      "1. Two leaf passes, not one. A single haul at Thanksgiving leaves too many leaves smothering the crown of the grass through winter.",
      "2. Final mow short — around 2.5 inches — to prevent snow mold and matting.",
      "3. Aerate cool-season lawns. Fall is the best window for core aeration in the northern half of the country.",
      "4. Overseed thin spots. Cool nights and warm days germinate seed fast in September and early October.",
      "5. Fertilize with a winterizer. Higher potassium builds cold tolerance and stores energy in the roots.",
      "6. Cut back perennials once they've browned. Leave a few seed heads standing for winter interest and birds.",
      "7. Shut off and blow out irrigation before the first hard freeze.",
      "8. Trim back overgrown hedges lightly — heavy pruning waits for late winter.",
      "9. Book snow service now (PlowWow does this well) so you're on the route before the first storm.",
      "10. Take a walk with a notebook. Every problem you spot in November is easier to fix in April.",
    ],
    author: "ProMows Crew",
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-08",
    tags: ["Seasonal", "Cleanups"],
    readMinutes: 5,
  },
  {
    slug: "landscape-design-that-lasts",
    title: "Landscape design that still looks good in year five",
    excerpt:
      "The prettiest bed on install day is often a mess by year three. Here's how we design plantings that mature instead of decline.",
    body: [
      "Most landscape disappointments trace back to the same mistake: designing for install day instead of year five. Plants grow. Shrubs that looked balanced at three gallons crowd each other out by year three, and the once-tidy bed becomes a maintenance headache.",
      "The fix starts on paper. We size plantings for their mature footprint, not the nursery pot, and we leave gaps that look sparse for a season. Mulch fills the gap; time fills the design.",
      "We also lean native. A native plant in the right climate zone needs less water, less feeding, and less babysitting than an ornamental import — and it holds up when you go on vacation in August.",
      "Finally, we design for the crew that will maintain it. Straight edges, mowable transitions, and no fussy borders. A landscape that's easy to care for is a landscape that gets cared for.",
    ],
    author: "ProMows Crew",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    tags: ["Landscape design"],
    readMinutes: 4,
  },
];

export const postBySlug = (slug: string): BlogPost | undefined =>
  posts.find((p) => p.slug === slug);
