GRANT INSERT ON public.portfolio_photo_contacts TO anon, authenticated;

CREATE POLICY "Anyone can attach their contact email"
  ON public.portfolio_photo_contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);