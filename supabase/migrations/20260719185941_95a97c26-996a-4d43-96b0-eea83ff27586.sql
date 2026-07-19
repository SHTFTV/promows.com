
CREATE POLICY "Public reads portfolio objects" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'portfolio');
