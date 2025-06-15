
-- Upload: Users can insert objects to their own folder (WITH CHECK, not USING)
CREATE POLICY "Authenticated users can upload to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: Users can view/list objects in their folder (still USING)
CREATE POLICY "Authenticated users can read their files"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: Users can delete objects in their folder
CREATE POLICY "Authenticated users can delete their files"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
