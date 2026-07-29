
-- 1. Private schema for role-check helpers (not exposed via the Data API)
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION app_private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;

CREATE OR REPLACE FUNCTION app_private.is_approved_photo(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.portfolio_photos WHERE storage_path = _path AND is_approved = true);
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM public;
REVOKE ALL ON FUNCTION app_private.is_staff(uuid) FROM public;
REVOKE ALL ON FUNCTION app_private.is_approved_photo(text) FROM public;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_approved_photo(text) TO anon, authenticated, service_role;

-- 2. Recreate all policies against the private helpers
DROP POLICY IF EXISTS "Staff updates posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin deletes posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff reads all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff writes posts" ON public.blog_posts;
CREATE POLICY "Staff updates posts" ON public.blog_posts FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "Admin deletes posts" ON public.blog_posts FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff reads all posts" ON public.blog_posts FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR is_published = true);
CREATE POLICY "Staff writes posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff updates cities" ON public.cities;
DROP POLICY IF EXISTS "Admin deletes cities" ON public.cities;
DROP POLICY IF EXISTS "Staff reads all cities" ON public.cities;
DROP POLICY IF EXISTS "Staff writes cities" ON public.cities;
CREATE POLICY "Staff updates cities" ON public.cities FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "Admin deletes cities" ON public.cities FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff reads all cities" ON public.cities FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR is_published = true);
CREATE POLICY "Staff writes cities" ON public.cities FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can read founding signups" ON public.founding_signups;
DROP POLICY IF EXISTS "Admin deletes signups" ON public.founding_signups;
CREATE POLICY "Staff can read founding signups" ON public.founding_signups FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY "Admin deletes signups" ON public.founding_signups FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff can read pro applications" ON public.pro_applications;
DROP POLICY IF EXISTS "Staff can update applications" ON public.pro_applications;
DROP POLICY IF EXISTS "Admin deletes applications" ON public.pro_applications;
CREATE POLICY "Staff can read pro applications" ON public.pro_applications FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY "Staff can update applications" ON public.pro_applications FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "Admin deletes applications" ON public.pro_applications FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'admin'));
-- No INSERT/UPDATE/DELETE policies: role changes are server-side (service_role) only
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

-- 3. portfolio_photos: hide uploader contact data from the public
DROP POLICY IF EXISTS "Public reads approved photos" ON public.portfolio_photos;
DROP POLICY IF EXISTS "Staff can update photos" ON public.portfolio_photos;
DROP POLICY IF EXISTS "Admin deletes photos" ON public.portfolio_photos;
CREATE POLICY "Staff reads photos" ON public.portfolio_photos FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY "Staff can update photos" ON public.portfolio_photos FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "Admin deletes photos" ON public.portfolio_photos FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.portfolio_photos FROM anon;

CREATE OR REPLACE VIEW public.portfolio_photos_public AS
  SELECT id, storage_path, caption, split_part(uploader_name, ' ', 1) AS uploader_name, created_at
  FROM public.portfolio_photos
  WHERE is_approved = true;
GRANT SELECT ON public.portfolio_photos_public TO anon, authenticated;

-- 4. Storage: no blanket public read, stricter uploads
DROP POLICY IF EXISTS "Public reads portfolio objects" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload portfolio photo" ON storage.objects;
CREATE POLICY "Read approved portfolio objects" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'portfolio' AND app_private.is_approved_photo(name));
CREATE POLICY "Anyone can upload portfolio photo" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'portfolio'
    AND (storage.foldername(name))[1] = 'uploads'
    AND array_length(storage.foldername(name), 1) = 1
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','heic')
    AND char_length(name) <= 300
  );

-- 5. Remove the publicly callable definer functions
DROP POLICY IF EXISTS "Staff can read portfolio objects" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update portfolio objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete portfolio objects" ON storage.objects;
CREATE POLICY "Staff can read portfolio objects" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND app_private.is_staff(auth.uid()));
CREATE POLICY "Staff can update portfolio objects" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND app_private.is_staff(auth.uid()));
CREATE POLICY "Admin can delete portfolio objects" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND app_private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);
