DROP POLICY IF EXISTS "Public reads approved photos" ON public.portfolio_photos;

ALTER VIEW public.portfolio_photos_public SET (security_invoker = false);
ALTER VIEW public.portfolio_photos_public SET (security_barrier = true);

REVOKE ALL ON public.portfolio_photos FROM anon, authenticated;
GRANT INSERT ON public.portfolio_photos TO anon, authenticated;
GRANT ALL ON public.portfolio_photos TO service_role;

GRANT SELECT ON public.portfolio_photos_public TO anon, authenticated;
GRANT SELECT ON public.portfolio_photos_public TO service_role;