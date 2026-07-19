import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Clock } from "lucide-react";
import { postBySlug, posts } from "@/data/blog";
import { SITE_URL, LOGO_URL, OG_IMAGE_URL, seoLinks, site } from "@/data/site";
import { PartnerCallout } from "@/components/site/PartnerCallout";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = postBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const path = `/blog/${params.slug}`;

    if (!p) {
      return {
        meta: [
          { title: "Post not found — ProMows" },
          { name: "description", content: "This post is unavailable." },
          { name: "robots", content: "noindex" },
        ],
        links: seoLinks(path),
      };
    }

    const title = `${p.title} — ProMows Blog`;
    return {
      meta: [
        { title },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}${path}` },
        { property: "og:image", content: OG_IMAGE_URL },
        { property: "og:locale", content: site.locale },
        { property: "article:published_time", content: p.publishedAt },
        { property: "article:modified_time", content: p.updatedAt },
        { property: "article:author", content: p.author },
        ...p.tags.map((t) => ({ property: "article:tag", content: t })),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p.title },
        { name: "twitter:description", content: p.excerpt },
        { name: "twitter:image", content: OG_IMAGE_URL },
      ],
      links: seoLinks(path),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: p.excerpt,
            image: OG_IMAGE_URL,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
            author: { "@type": "Organization", name: p.author, url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: site.name,
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: LOGO_URL },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
            keywords: p.tags.join(", "),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}${path}` },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-extrabold">Post not found</h1>
      <Link to="/blog" className="mt-6 inline-block font-bold text-primary hover:underline">
        Back to the blog →
      </Link>
    </div>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article>
        <header className="border-b border-border bg-accent/30">
          <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
            <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link to="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/blog" className="hover:underline">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-primary">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{post.author}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {post.readMinutes} min read
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="prose prose-lg max-w-none">
            {post.body.map((para, i) => (
              <p key={i} className="mb-5 text-lg leading-relaxed text-foreground">
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>

      <PartnerCallout />

      {others.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-heading text-2xl font-extrabold">Keep reading</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:-translate-y-0.5 hover:border-primary/40 transition-all"
              >
                <h3 className="font-heading text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
