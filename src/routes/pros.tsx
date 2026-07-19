import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Upload, ImagePlus } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE_URL, OG_IMAGE_URL, seoLinks } from "@/data/site";

export const Route = createFileRoute("/pros")({
  head: () => ({
    meta: [
      { title: "Join ProMows — Hiring Top-Quality Lawn Care Professionals" },
      {
        name: "description",
        content:
          "We're hiring reliable lawn care pros and crews across North America. Apply in under a minute, share your best work, and get connected to steady routes.",
      },
      { property: "og:title", content: "Now hiring — Lawn Care Pros at ProMows" },
      { property: "og:description", content: "Apply to join ProMows. Steady routes, straightforward pay, professional crews only." },
      { property: "og:url", content: `${SITE_URL}/pros` },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Now hiring — ProMows lawn care pros" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: seoLinks("/pros"),
  }),
  component: ProsPage,
});

const appSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  phone: z.string().trim().min(5, "Phone is required").max(40),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  service_area: z.string().trim().min(2, "Service area is required").max(200),
  description: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

type ApprovedPhoto = { id: string; url: string; caption: string | null; uploader_name: string };

function ProsPage() {
  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary ring-1 ring-primary/40">
            Now hiring
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-5xl">
            Top-quality lawn care professionals — apply today
          </h1>
          <p className="mt-4 max-w-2xl text-lg opacity-80">
            Solo operators, established crews, and landscape pros welcome. Bring your standards; we bring the routes,
            the software, and steady weekly work.
          </p>
        </div>
      </section>

      <ProApplicationForm />
      <PortfolioUpload />
      <PortfolioGallery />
    </>
  );
}

function ProApplicationForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service_area: "", description: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = appSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your entries");
      return;
    }
    setStatus("submitting");
    const { error: dbErr } = await supabase.from("pro_applications").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      service_area: parsed.data.service_area,
      description: parsed.data.description,
    });
    if (dbErr) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setStatus("success");
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16" aria-labelledby="apply-title">
      <h2 id="apply-title" className="font-heading text-3xl font-extrabold md:text-4xl">
        Apply to join
      </h2>
      <p className="mt-2 text-muted-foreground">
        Takes under a minute. We'll reach out within 48 hours.
      </p>

      {status === "success" ? (
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 font-heading text-xl font-bold">Application received</h3>
          <p className="mt-2 text-muted-foreground">
            Thanks — we'll review your info and reach out shortly. If you have photos of past work, please add them below.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Full name *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Phone *</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-sm font-semibold">Email (optional)</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold">Service area *</span>
            <input
              required
              placeholder="City, state or zip codes you cover"
              value={form.service_area}
              onChange={(e) => setForm({ ...form, service_area: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold">Tell us about your work *</span>
            <textarea
              required
              rows={5}
              placeholder="Years in business, crew size, equipment, services offered, and anything else we should know."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit application
          </button>
        </form>
      )}
    </section>
  );
}

function PortfolioUpload() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Choose a photo to upload");
    if (name.trim().length < 2) return setError("Add your name");
    if (file.size > 8 * 1024 * 1024) return setError("Photo must be under 8MB");
    if (!file.type.startsWith("image/")) return setError("File must be an image");

    setStatus("uploading");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `submissions/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (upErr) {
      setStatus("error");
      setError("Upload failed. Please try again.");
      return;
    }
    const { error: dbErr } = await supabase.from("portfolio_photos").insert({
      uploader_name: name.trim(),
      uploader_email: email.trim() || null,
      storage_path: path,
      caption: caption.trim() || null,
      is_approved: false,
    });
    if (dbErr) {
      setStatus("error");
      setError("Saved photo but couldn't record it. Contact us.");
      return;
    }
    setStatus("success");
    setName("");
    setEmail("");
    setCaption("");
    setFile(null);
  };

  return (
    <section className="bg-accent/30 py-16" aria-labelledby="upload-title">
      <div className="mx-auto max-w-3xl px-4">
        <h2 id="upload-title" className="font-heading text-3xl font-extrabold md:text-4xl">
          Share your best work
        </h2>
        <p className="mt-2 text-muted-foreground">
          Upload photos of a job you're proud of. Approved shots appear in our public gallery.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-background p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-3 font-heading text-xl font-bold">Photo submitted</h3>
            <p className="mt-2 text-muted-foreground">
              We'll review and publish it soon. Upload another anytime.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 rounded-lg border border-border bg-background px-5 py-2 font-bold text-foreground hover:bg-accent"
            >
              Upload another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Your name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Email (optional)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Caption</span>
              <input
                placeholder="Front-yard reset in Denver, CO"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Photo * (JPG/PNG, up to 8MB)</span>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-accent">
                  <ImagePlus className="h-4 w-4" />
                  {file ? "Change photo" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
              </div>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={status === "uploading"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Submit photo
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function PortfolioGallery() {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("portfolio_photos")
        .select("id, storage_path, caption, uploader_name")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(24);
      if (cancelled || !data) {
        setLoading(false);
        return;
      }
      const withUrls: ApprovedPhoto[] = data.map((p) => ({
        id: p.id,
        caption: p.caption,
        uploader_name: p.uploader_name,
        url: supabase.storage.from("portfolio").getPublicUrl(p.storage_path).data.publicUrl,
      }));
      setPhotos(withUrls);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16" aria-labelledby="gallery-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="gallery-title" className="font-heading text-3xl font-extrabold md:text-4xl">
            Pro portfolio
          </h2>
          <p className="mt-2 text-muted-foreground">Recent work from ProMows crews and partners.</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Loading gallery…</p>
      ) : photos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          No approved photos yet. Be the first to submit above.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <figure key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img
                src={p.url}
                alt={p.caption ?? `Lawn care work by ${p.uploader_name}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="p-4">
                {p.caption && <p className="text-sm text-foreground">{p.caption}</p>}
                <p className="mt-1 text-xs font-semibold text-muted-foreground">— {p.uploader_name}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
