REVOKE SELECT ON public.portfolio_photos FROM authenticated;
GRANT SELECT (id, storage_path, caption, uploader_name, created_at, is_approved) ON public.portfolio_photos TO authenticated;
GRANT ALL ON public.portfolio_photos TO service_role;
