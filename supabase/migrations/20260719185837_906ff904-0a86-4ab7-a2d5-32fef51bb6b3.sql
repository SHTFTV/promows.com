
-- Founding pricing signups
CREATE TABLE public.founding_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  address text,
  city text,
  state text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.founding_signups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founding_signups TO authenticated;
GRANT ALL ON public.founding_signups TO service_role;
ALTER TABLE public.founding_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit founding signup" ON public.founding_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read founding signups" ON public.founding_signups
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Admin deletes signups" ON public.founding_signups
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Pro applications
CREATE TABLE public.pro_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  service_area text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pro_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_applications TO authenticated;
GRANT ALL ON public.pro_applications TO service_role;
ALTER TABLE public.pro_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit pro application" ON public.pro_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read pro applications" ON public.pro_applications
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff can update applications" ON public.pro_applications
  FOR UPDATE TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Admin deletes applications" ON public.pro_applications
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Portfolio photos
CREATE TABLE public.portfolio_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_name text NOT NULL,
  uploader_email text,
  storage_path text NOT NULL,
  caption text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.portfolio_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_photos TO authenticated;
GRANT ALL ON public.portfolio_photos TO service_role;
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit photo" ON public.portfolio_photos
  FOR INSERT TO anon, authenticated WITH CHECK (is_approved = false);
CREATE POLICY "Public reads approved photos" ON public.portfolio_photos
  FOR SELECT TO anon, authenticated USING (is_approved = true OR is_staff(auth.uid()));
CREATE POLICY "Staff can update photos" ON public.portfolio_photos
  FOR UPDATE TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Admin deletes photos" ON public.portfolio_photos
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
