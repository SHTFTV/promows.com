ALTER VIEW public.portfolio_photos_public SET (security_invoker = true);

CREATE TABLE IF NOT EXISTS public.portfolio_photo_contacts (
  photo_id uuid PRIMARY KEY REFERENCES public.portfolio_photos(id) ON DELETE CASCADE,
  uploader_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.portfolio_photo_contacts TO service_role;
ALTER TABLE public.portfolio_photo_contacts ENABLE ROW LEVEL SECURITY;

INSERT INTO public.portfolio_photo_contacts (photo_id, uploader_email)
SELECT id, uploader_email FROM public.portfolio_photos
WHERE uploader_email IS NOT NULL
ON CONFLICT (photo_id) DO NOTHING;

ALTER TABLE public.portfolio_photos DROP COLUMN IF EXISTS uploader_email;

DROP POLICY IF EXISTS "Public reads approved photos" ON public.portfolio_photos;
CREATE POLICY "Public reads approved photos"
  ON public.portfolio_photos FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

GRANT SELECT ON public.portfolio_photos TO anon, authenticated;