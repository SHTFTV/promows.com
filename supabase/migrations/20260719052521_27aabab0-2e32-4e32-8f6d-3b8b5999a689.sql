
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
     WHERE user_id = _user_id AND role IN ('admin','editor')
  );
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Cities
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL,
  intro TEXT NOT NULL,
  neighborhoods TEXT[] NOT NULL DEFAULT '{}',
  services TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published cities"
  ON public.cities FOR SELECT TO anon USING (is_published = TRUE);
CREATE POLICY "Staff reads all cities"
  ON public.cities FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR is_published = TRUE);
CREATE POLICY "Staff writes cities"
  ON public.cities FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff updates cities"
  ON public.cities FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin deletes cities"
  ON public.cities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER cities_updated_at BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT[] NOT NULL DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'ProMows Crew',
  tags TEXT[] NOT NULL DEFAULT '{}',
  read_minutes INTEGER NOT NULL DEFAULT 4,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published posts"
  ON public.blog_posts FOR SELECT TO anon USING (is_published = TRUE);
CREATE POLICY "Staff reads all posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR is_published = TRUE);
CREATE POLICY "Staff writes posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff updates posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin deletes posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed cities
INSERT INTO public.cities (slug,name,state,region,intro,neighborhoods,services,faqs,is_published,published_at,updated_at) VALUES
('austin-tx','Austin','TX','Central Texas',
 'ProMows serves homeowners and property managers across Austin — from Zilker and Barton Hills to Mueller and Round Rock. We tune every mow, cleanup, and fertilization plan to the Central Texas climate, so your lawn stays green through the heat and bounces back after every dry spell.',
 ARRAY['Zilker','Barton Hills','Mueller','Hyde Park','Round Rock','Cedar Park'],
 ARRAY['mowing','fertilization','landscape-design','yard-cleanup'],
 '[{"q":"How often should my Austin lawn be mowed?","a":"Weekly from April through October, bi-weekly in the cooler months. St. Augustine and Bermuda both grow fast here and benefit from a consistent cut height."},{"q":"Do you handle drought-tolerant landscaping?","a":"Yes — native Texas plantings, xeriscape beds, and drip irrigation prep are all part of our Austin landscape design work."},{"q":"What ZIP codes do you cover in Austin?","a":"Most Austin metro ZIP codes including 78701, 78704, 78745, 78751, and Round Rock 78664. Send us your address for a same-day check."}]'::jsonb,
 TRUE,'2026-07-01','2026-07-01'),
('denver-co','Denver','CO','Front Range',
 'Front Range lawns take a beating — thin soils, dry air, and sudden hail. ProMows crews in Denver mow, aerate, and fertilize on schedules built for Kentucky Bluegrass and Tall Fescue, and our partner PlowWow handles snow so your driveway is clear before you leave for work.',
 ARRAY['Wash Park','Cherry Creek','Highlands','Stapleton','Aurora','Lakewood'],
 ARRAY['mowing','fertilization','seasonal-cleanups','hedge-tree-trimming'],
 '[{"q":"When should I start lawn care in Denver?","a":"Mid-April, once the last hard frost passes. Spring cleanup and a first fertilization pass set the tone for the whole season."},{"q":"Do you coordinate snow removal with PlowWow?","a":"Yes — sign up for winter service and PlowWow handles driveways, walks, and salt on the same address we mow all summer."},{"q":"Do you aerate lawns in Denver?","a":"Every fall. Core aeration relieves the compaction our clay soils build up and helps water reach the root zone."}]'::jsonb,
 TRUE,'2026-07-05','2026-07-05'),
('minneapolis-mn','Minneapolis','MN','Twin Cities',
 'ProMows keeps Twin Cities lawns tight from the first spring cleanup through the final fall leaf haul. We work Minneapolis, St. Paul, and the western suburbs — and our partner PlowWow takes over the driveway in November.',
 ARRAY['Uptown','Linden Hills','Northeast','Edina','St. Paul','Minnetonka'],
 ARRAY['mowing','seasonal-cleanups','fertilization','yard-cleanup'],
 '[{"q":"How do you handle fall leaf cleanup?","a":"Two-pass service: mid-October and late-November. We mulch, bag, and haul — nothing left on the lawn under the snow."},{"q":"Do you offer year-round property care?","a":"Lawn and landscape from ProMows April–November, snow and ice from PlowWow December–March. Same address, one point of contact."},{"q":"What grass types do you fertilize?","a":"Kentucky Bluegrass, Fine Fescue, and Perennial Rye mixes typical of Minneapolis lawns. Programs are tuned by soil test on request."}]'::jsonb,
 TRUE,'2026-07-10','2026-07-10'),
('raleigh-nc','Raleigh','NC','Research Triangle',
 'Raleigh lawns run on warm-season grasses — Bermuda, Zoysia, and Centipede. ProMows crews across the Triangle mow, edge, and fertilize on schedules that keep those lawns dense, green, and weed-free from March through October.',
 ARRAY['North Hills','Five Points','Cameron Village','Cary','Apex','Durham'],
 ARRAY['mowing','fertilization','hedge-tree-trimming','landscape-design'],
 '[{"q":"When does mowing season start in Raleigh?","a":"Late March once soil warms above 60°F. Bermuda greens up first, Zoysia a few weeks later."},{"q":"Do you do landscape design in the Triangle?","a":"Yes — bed refresh, native plantings, and mulch install across Raleigh, Cary, and Durham."},{"q":"Do you treat for crabgrass?","a":"Pre-emergent goes down in February and April as part of our standard fertilization program."}]'::jsonb,
 TRUE,'2026-07-12','2026-07-12');

-- Seed blog posts
INSERT INTO public.blog_posts (slug,title,excerpt,body,author,tags,read_minutes,is_published,published_at,updated_at) VALUES
('how-often-should-you-mow','How often should you mow? A season-by-season guide',
 'Mowing frequency isn''t a fixed schedule — it flexes with grass type, rainfall, and the calendar. Here''s how ProMows crews decide.',
 ARRAY[
  'Every lawn has a rhythm, and mowing too often (or too rarely) throws it off. The one-third rule still holds: never cut more than a third of the blade in a single pass. From there, frequency is a function of grass type, rainfall, and time of year.',
  'In peak growth — May through July for cool-season lawns, June through September for warm-season — weekly mowing is standard. Skip a week and you''ll scalp the lawn trying to catch up, which stresses the roots and invites weeds.',
  'Shoulder seasons (April, October) usually flex to every 10 days. Once growth slows in late fall, a final short cut before dormancy prevents matting under leaves and snow.',
  'The fastest way to know: watch the blade length, not the calendar. If the tips are above your target height by more than a third, it''s time to mow.'
 ],
 'ProMows Crew', ARRAY['Mowing','Lawn care'], 4, TRUE, '2026-05-12','2026-05-12'),
('fall-cleanup-checklist','The ProMows fall cleanup checklist',
 'Ten things every homeowner should do before the first hard freeze — from leaf haul to winter irrigation shut-off.',
 ARRAY[
  'Fall is when smart lawn owners set up next spring. Do these ten things and April looks a lot better.',
  '1. Two leaf passes, not one. A single haul at Thanksgiving leaves too many leaves smothering the crown of the grass through winter.',
  '2. Final mow short — around 2.5 inches — to prevent snow mold and matting.',
  '3. Aerate cool-season lawns. Fall is the best window for core aeration in the northern half of the country.',
  '4. Overseed thin spots. Cool nights and warm days germinate seed fast in September and early October.',
  '5. Fertilize with a winterizer. Higher potassium builds cold tolerance and stores energy in the roots.',
  '6. Cut back perennials once they''ve browned. Leave a few seed heads standing for winter interest and birds.',
  '7. Shut off and blow out irrigation before the first hard freeze.',
  '8. Trim back overgrown hedges lightly — heavy pruning waits for late winter.',
  '9. Book snow service now (PlowWow does this well) so you''re on the route before the first storm.',
  '10. Take a walk with a notebook. Every problem you spot in November is easier to fix in April.'
 ],
 'ProMows Crew', ARRAY['Seasonal','Cleanups'], 5, TRUE, '2026-06-01','2026-07-08'),
('landscape-design-that-lasts','Landscape design that still looks good in year five',
 'The prettiest bed on install day is often a mess by year three. Here''s how we design plantings that mature instead of decline.',
 ARRAY[
  'Most landscape disappointments trace back to the same mistake: designing for install day instead of year five. Plants grow. Shrubs that looked balanced at three gallons crowd each other out by year three, and the once-tidy bed becomes a maintenance headache.',
  'The fix starts on paper. We size plantings for their mature footprint, not the nursery pot, and we leave gaps that look sparse for a season. Mulch fills the gap; time fills the design.',
  'We also lean native. A native plant in the right climate zone needs less water, less feeding, and less babysitting than an ornamental import — and it holds up when you go on vacation in August.',
  'Finally, we design for the crew that will maintain it. Straight edges, mowable transitions, and no fussy borders. A landscape that''s easy to care for is a landscape that gets cared for.'
 ],
 'ProMows Crew', ARRAY['Landscape design'], 4, TRUE, '2026-06-20','2026-06-20');
