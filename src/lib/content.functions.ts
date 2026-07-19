import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { cities as staticCities, type City } from "@/data/cities";
import { posts as staticPosts, type BlogPost } from "@/data/blog";

// Row shapes (DB → app DTO)
interface CityRow {
  slug: string;
  name: string;
  state: string;
  region: string;
  intro: string;
  neighborhoods: string[];
  services: string[];
  faqs: { q: string; a: string }[];
  updated_at: string;
  published_at: string | null;
}
interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  author: string;
  tags: string[];
  read_minutes: number;
  updated_at: string;
  published_at: string | null;
}

const cityFromRow = (r: CityRow): City => ({
  slug: r.slug,
  name: r.name,
  state: r.state,
  region: r.region,
  intro: r.intro,
  neighborhoods: r.neighborhoods,
  services: r.services,
  faqs: r.faqs,
  updatedAt: (r.updated_at ?? r.published_at ?? "").slice(0, 10),
});
const postFromRow = (r: PostRow): BlogPost => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body,
  author: r.author,
  tags: r.tags,
  readMinutes: r.read_minutes,
  publishedAt: (r.published_at ?? r.updated_at ?? "").slice(0, 10),
  updatedAt: (r.updated_at ?? r.published_at ?? "").slice(0, 10),
});

async function fetchCitiesFromDb(): Promise<City[] | null> {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("slug,name,state,region,intro,neighborhoods,services,faqs,updated_at,published_at")
      .eq("is_published", true)
      .order("name");
    if (error || !data) return null;
    return (data as unknown as CityRow[]).map(cityFromRow);
  } catch {
    return null;
  }
}

async function fetchPostsFromDb(): Promise<BlogPost[] | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,body,author,tags,read_minutes,updated_at,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (error || !data) return null;
    return (data as unknown as PostRow[]).map(postFromRow);
  } catch {
    return null;
  }
}

export const getPublishedCities = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await fetchCitiesFromDb();
  return rows && rows.length > 0 ? rows : staticCities;
});

export const getPublishedCity = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const rows = await fetchCitiesFromDb();
    const list = rows && rows.length > 0 ? rows : staticCities;
    return list.find((c) => c.slug === data.slug) ?? null;
  });

export const getPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await fetchPostsFromDb();
  return rows && rows.length > 0 ? rows : staticPosts;
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const rows = await fetchPostsFromDb();
    const list = rows && rows.length > 0 ? rows : staticPosts;
    const post = list.find((p) => p.slug === data.slug) ?? null;
    const related = post
      ? list.filter((p) => p.slug !== post.slug).slice(0, 3)
      : [];
    return { post, related };
  });
