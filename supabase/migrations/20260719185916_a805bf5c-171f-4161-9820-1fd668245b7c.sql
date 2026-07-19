
CREATE POLICY "Anyone can upload portfolio photo" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Staff can read portfolio objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND is_staff(auth.uid()));

CREATE POLICY "Staff can update portfolio objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND is_staff(auth.uid()));

CREATE POLICY "Admin can delete portfolio objects" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND has_role(auth.uid(), 'admin'::app_role));
