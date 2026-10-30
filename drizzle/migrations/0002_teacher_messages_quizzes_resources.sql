CREATE TABLE public.class_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  recipient_id uuid,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.class_messages TO authenticated;
GRANT ALL ON public.class_messages TO service_role;
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg read" ON public.class_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR (recipient_id IS NULL AND (public.is_class_teacher(class_id) OR public.is_class_member(class_id))));
CREATE POLICY "msg send" ON public.class_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND (public.is_class_teacher(class_id) OR public.is_class_member(class_id)));
CREATE POLICY "msg mark read" ON public.class_messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid() OR (recipient_id IS NULL AND public.is_class_teacher(class_id))) WITH CHECK (true);

CREATE TABLE public.class_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL CHECK (kind IN ('lesson','quiz','resource')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body text CHECK (char_length(body) <= 20000),
  questions jsonb,
  link_url text CHECK (link_url IS NULL OR link_url ~ '^https?://'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.class_content TO authenticated;
GRANT ALL ON public.class_content TO service_role;
ALTER TABLE public.class_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content read" ON public.class_content FOR SELECT TO authenticated
  USING (public.is_class_teacher(class_id) OR public.is_class_member(class_id));
CREATE POLICY "content add" ON public.class_content FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.is_class_teacher(class_id));
CREATE POLICY "content delete" ON public.class_content FOR DELETE TO authenticated
  USING (public.is_class_teacher(class_id));