
DROP POLICY "Anyone can submit founding signup" ON public.founding_signups;
CREATE POLICY "Anyone can submit founding signup" ON public.founding_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(email) BETWEEN 3 AND 255);

DROP POLICY "Anyone can submit pro application" ON public.pro_applications;
CREATE POLICY "Anyone can submit pro application" ON public.pro_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(phone) BETWEEN 5 AND 40
    AND char_length(service_area) BETWEEN 2 AND 200
    AND char_length(description) BETWEEN 5 AND 2000
  );

DROP POLICY "Anyone can submit photo" ON public.portfolio_photos;
CREATE POLICY "Anyone can submit photo" ON public.portfolio_photos
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    is_approved = false
    AND char_length(uploader_name) BETWEEN 1 AND 120
    AND char_length(storage_path) BETWEEN 1 AND 500
  );
