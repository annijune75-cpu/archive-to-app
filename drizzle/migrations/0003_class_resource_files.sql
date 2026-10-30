ALTER TABLE public.class_content ADD COLUMN file_path text;
CREATE OR REPLACE FUNCTION public.try_uuid(t text) RETURNS uuid LANGUAGE plpgsql IMMUTABLE AS $$ BEGIN RETURN t::uuid; EXCEPTION WHEN others THEN RETURN NULL; END $$;
CREATE POLICY class_resources_teacher_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'class-resources' AND public.is_class_teacher(public.try_uuid((storage.foldername(name))[1])));
CREATE POLICY class_resources_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'class-resources' AND (public.is_class_teacher(public.try_uuid((storage.foldername(name))[1])) OR public.is_class_member(public.try_uuid((storage.foldername(name))[1]))));
CREATE POLICY class_resources_teacher_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'class-resources' AND public.is_class_teacher(public.try_uuid((storage.foldername(name))[1])));