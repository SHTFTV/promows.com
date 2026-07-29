ALTER VIEW public.portfolio_photos_public SET (security_invoker = true);

CREATE POLICY "Public reads approved photos" ON public.portfolio_photos
  FOR SELECT TO anon, authenticated USING (is_approved = true);

GRANT SELECT (id, storage_path, caption, uploader_name, created_at) ON public.portfolio_photos TO anon;
