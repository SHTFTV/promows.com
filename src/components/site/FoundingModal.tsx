import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export function FoundingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ email: "", address: "", city: "", state: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your entries");
      return;
    }
    setStatus("submitting");
    const { error: dbErr } = await supabase.from("founding_signups").insert({
      email: parsed.data.email,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      notes: parsed.data.notes || null,
    });
    if (dbErr) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setStatus("success");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founding-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>

        {status === "success" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-3 font-heading text-2xl font-extrabold">You're on the list</h2>
            <p className="mt-2 text-muted-foreground">
              We'll email you the moment we open your neighborhood so you can lock in the $10/month founding rate.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-bold text-primary-foreground"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Founding offer · $10/mo
            </span>
            <h2 id="founding-title" className="mt-3 font-heading text-2xl font-extrabold">
              Claim your block
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One household per block. Drop your email and address to reserve your spot.
            </p>

            <form onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Email *</span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Street address</span>
                <input
                  type="text"
                  placeholder="123 Maple Street"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm font-semibold">City</span>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-semibold">State</span>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-sm font-semibold">Anything we should know?</span>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                />
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                Lock in my founding rate
              </button>
              <p className="text-xs text-muted-foreground">
                No credit card. We only email you when we open your area.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
