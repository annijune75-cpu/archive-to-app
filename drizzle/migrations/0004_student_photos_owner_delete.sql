CREATE POLICY student_photos_own_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'student-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);