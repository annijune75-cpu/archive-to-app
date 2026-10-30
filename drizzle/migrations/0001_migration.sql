-- Roles, learning and class features (from the project's existing setup scripts).
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_roles ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());

CREATE SCHEMA IF NOT EXISTS bridgelib_private; REVOKE ALL ON SCHEMA bridgelib_private FROM PUBLIC; GRANT USAGE ON SCHEMA bridgelib_private TO authenticated;
CREATE FUNCTION bridgelib_private.has_role(_user_id uuid,_role text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE FUNCTION bridgelib_private.class_teacher(_class_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT bridgelib_private.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.classes WHERE id=_class_id AND created_by=auth.uid()) OR EXISTS(SELECT 1 FROM public.teacher_class_assignments WHERE class_id=_class_id AND teacher_id=auth.uid()) $$;
CREATE FUNCTION bridgelib_private.class_member(_class_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.class_memberships WHERE class_id=_class_id AND student_id=auth.uid() AND status='active') $$;
REVOKE ALL ON FUNCTION bridgelib_private.has_role(uuid,text),bridgelib_private.class_teacher(uuid),bridgelib_private.class_member(uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION bridgelib_private.has_role(uuid,text),bridgelib_private.class_teacher(uuid),bridgelib_private.class_member(uuid) TO authenticated;
CREATE FUNCTION public.has_role(_user_id uuid,_role text) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT bridgelib_private.has_role(_user_id,_role) $$;
CREATE FUNCTION public.is_class_teacher(_class_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT bridgelib_private.class_teacher(_class_id) $$;
CREATE FUNCTION public.is_class_member(_class_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT bridgelib_private.class_member(_class_id) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,text),public.is_class_teacher(uuid),public.is_class_member(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.has_role(uuid,text),public.is_class_teacher(uuid),public.is_class_member(uuid) TO authenticated;
CREATE POLICY admins_read_roles ON public.user_roles FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(full_name,learner_path,education_level,grade_level,school_name,county,target_exam_year,onboarding_completed,updated_at) ON public.profiles TO authenticated;
CREATE POLICY admin_profiles_read ON public.profiles FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY class_teacher_profiles_read ON public.profiles FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.class_memberships m WHERE m.student_id=profiles.id AND public.is_class_teacher(m.class_id)));
CREATE POLICY admin_schools ON public.schools FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.subjects TO anon; CREATE POLICY public_subjects ON public.subjects FOR SELECT TO anon USING(true);
CREATE POLICY admin_subjects ON public.subjects FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_lessons ON public.lessons FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
GRANT INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
CREATE POLICY admin_questions ON public.exam_questions FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_answers ON public.exam_question_answers FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_papers ON public.exam_papers FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_scholarships ON public.scholarships FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_plans_read ON public.subscription_plans FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_invoices_read ON public.school_invoices FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_school_payments_read ON public.school_payment_transactions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_premium_payments_read ON public.premium_payment_transactions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY exam_papers_admin_all ON storage.objects FOR ALL TO authenticated USING(bucket_id='exam-papers' AND public.has_role(auth.uid(),'admin')) WITH CHECK(bucket_id='exam-papers' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY classes_read ON public.classes FOR SELECT TO authenticated USING(public.is_class_teacher(id) OR public.is_class_member(id));
CREATE POLICY classes_create ON public.classes FOR INSERT TO authenticated WITH CHECK(created_by=auth.uid() AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin') OR public.has_role(auth.uid(),'admin')) AND (school_id IS NULL OR EXISTS(SELECT 1 FROM public.schools s WHERE s.id=school_id AND s.status='verified' AND (s.created_by=auth.uid() OR public.has_role(auth.uid(),'admin')))));
CREATE POLICY classes_edit ON public.classes FOR UPDATE TO authenticated USING(public.is_class_teacher(id)) WITH CHECK(public.is_class_teacher(id));
CREATE POLICY memberships_read ON public.class_memberships FOR SELECT TO authenticated USING(student_id=auth.uid() OR public.is_class_teacher(class_id));
CREATE POLICY memberships_remove ON public.class_memberships FOR DELETE TO authenticated USING(public.is_class_teacher(class_id));
CREATE POLICY teacher_assignments_read ON public.teacher_class_assignments FOR SELECT TO authenticated USING(teacher_id=auth.uid() OR public.is_class_teacher(class_id));
CREATE POLICY teacher_assignments_add ON public.teacher_class_assignments FOR INSERT TO authenticated WITH CHECK(assigned_by=auth.uid() AND public.is_class_teacher(class_id) AND (public.has_role(teacher_id,'teacher') OR public.has_role(teacher_id,'admin')));
CREATE POLICY teacher_assignments_remove ON public.teacher_class_assignments FOR DELETE TO authenticated USING(public.is_class_teacher(class_id));
CREATE POLICY invites_read ON public.class_invites FOR SELECT TO authenticated USING(public.is_class_teacher(class_id));
CREATE POLICY invites_create ON public.class_invites FOR INSERT TO authenticated WITH CHECK(created_by=auth.uid() AND public.is_class_teacher(class_id) AND expires_at>now() AND max_uses>0 AND use_count=0);
CREATE POLICY invites_revoke ON public.class_invites FOR UPDATE TO authenticated USING(public.is_class_teacher(class_id)) WITH CHECK(public.is_class_teacher(class_id));
REVOKE UPDATE ON public.class_invites FROM authenticated; GRANT UPDATE(revoked_at) ON public.class_invites TO authenticated;

CREATE TABLE public.course_enrollments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,subject_id bigint NOT NULL REFERENCES public.subjects(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,subject_id));
GRANT SELECT,INSERT,DELETE ON public.course_enrollments TO authenticated; GRANT ALL ON public.course_enrollments TO service_role;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_enrollments ON public.course_enrollments FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.lesson_completions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,lesson_id uuid NOT NULL REFERENCES public.lessons(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,lesson_id));
GRANT SELECT,INSERT,DELETE ON public.lesson_completions TO authenticated; GRANT ALL ON public.lesson_completions TO service_role;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_completions ON public.lesson_completions FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.lessons l WHERE l.id=lesson_id AND l.is_published));
CREATE TABLE public.feature_settings (key text PRIMARY KEY,label text NOT NULL,enabled boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.feature_settings TO anon,authenticated; GRANT INSERT,UPDATE ON public.feature_settings TO authenticated; GRANT ALL ON public.feature_settings TO service_role;
ALTER TABLE public.feature_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY features_read ON public.feature_settings FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY features_admin ON public.feature_settings FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
INSERT INTO public.feature_settings(key,label) VALUES('courses','Courses'),('practice','Practice exams'),('teacher','Teacher workspace'),('scholarships','Scholarships');
CREATE TABLE public.class_assignments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),class_id uuid NOT NULL REFERENCES public.classes(id),title text NOT NULL,instructions text NOT NULL,due_at timestamptz,max_score integer NOT NULL DEFAULT 100,created_by uuid NOT NULL REFERENCES public.profiles(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.class_assignments TO authenticated; GRANT ALL ON public.class_assignments TO service_role;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assignments_read ON public.class_assignments FOR SELECT TO authenticated USING(public.is_class_teacher(class_id) OR public.is_class_member(class_id));
CREATE POLICY assignments_create ON public.class_assignments FOR INSERT TO authenticated WITH CHECK(created_by=auth.uid() AND public.is_class_teacher(class_id));
CREATE POLICY assignments_edit ON public.class_assignments FOR UPDATE TO authenticated USING(public.is_class_teacher(class_id)) WITH CHECK(public.is_class_teacher(class_id));
CREATE POLICY assignments_delete ON public.class_assignments FOR DELETE TO authenticated USING(public.is_class_teacher(class_id));
CREATE TABLE public.assignment_submissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),assignment_id uuid NOT NULL REFERENCES public.class_assignments(id),student_id uuid NOT NULL REFERENCES public.profiles(id),work text NOT NULL,score integer,feedback text,graded_by uuid REFERENCES public.profiles(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(assignment_id,student_id));
GRANT SELECT,INSERT,UPDATE ON public.assignment_submissions TO authenticated; GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY submissions_read ON public.assignment_submissions FOR SELECT TO authenticated USING(student_id=auth.uid() OR EXISTS(SELECT 1 FROM public.class_assignments a WHERE a.id=assignment_id AND public.is_class_teacher(a.class_id)));
CREATE POLICY submissions_create ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK(student_id=auth.uid() AND score IS NULL AND graded_by IS NULL AND feedback IS NULL AND EXISTS(SELECT 1 FROM public.class_assignments a WHERE a.id=assignment_id AND public.is_class_member(a.class_id) AND (a.due_at IS NULL OR a.due_at>now())));
CREATE POLICY submissions_edit ON public.assignment_submissions FOR UPDATE TO authenticated USING(student_id=auth.uid() OR EXISTS(SELECT 1 FROM public.class_assignments a WHERE a.id=assignment_id AND public.is_class_teacher(a.class_id))) WITH CHECK(student_id=auth.uid() OR EXISTS(SELECT 1 FROM public.class_assignments a WHERE a.id=assignment_id AND public.is_class_teacher(a.class_id)));
CREATE FUNCTION public.validate_learning_record() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ DECLARE a public.class_assignments; BEGIN NEW.updated_at:=now(); IF TG_TABLE_NAME='class_assignments' THEN IF length(trim(NEW.title))<1 OR length(NEW.title)>200 OR length(trim(NEW.instructions))<1 OR NEW.max_score<1 THEN RAISE EXCEPTION 'Invalid assignment'; END IF; IF TG_OP='UPDATE' AND (NEW.class_id<>OLD.class_id OR NEW.created_by<>OLD.created_by) THEN RAISE EXCEPTION 'Assignment ownership cannot change'; END IF; ELSE SELECT * INTO a FROM public.class_assignments WHERE id=NEW.assignment_id; IF length(trim(NEW.work))<1 OR length(NEW.work)>50000 THEN RAISE EXCEPTION 'Invalid submission'; END IF; IF NEW.score IS NOT NULL AND (NEW.score<0 OR NEW.score>a.max_score) THEN RAISE EXCEPTION 'Score out of range'; END IF; IF TG_OP='UPDATE' THEN IF NEW.assignment_id<>OLD.assignment_id OR NEW.student_id<>OLD.student_id THEN RAISE EXCEPTION 'Submission ownership cannot change'; END IF; IF NOT public.is_class_teacher(a.class_id) THEN IF NEW.score IS DISTINCT FROM OLD.score OR NEW.graded_by IS DISTINCT FROM OLD.graded_by OR NEW.feedback IS DISTINCT FROM OLD.feedback OR OLD.score IS NOT NULL OR (a.due_at IS NOT NULL AND a.due_at<=now()) THEN RAISE EXCEPTION 'Only the assigned teacher may grade'; END IF; ELSE IF NEW.work<>OLD.work THEN RAISE EXCEPTION 'Teachers cannot change student work'; END IF; NEW.graded_by:=auth.uid(); END IF; END IF; END IF; RETURN NEW; END $$;
CREATE TRIGGER validate_assignment BEFORE INSERT OR UPDATE ON public.class_assignments FOR EACH ROW EXECUTE FUNCTION public.validate_learning_record();
CREATE TRIGGER validate_submission BEFORE INSERT OR UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.validate_learning_record();
CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN NEW.updated_at:=now(); RETURN NEW; END $$;
CREATE TRIGGER touch_features BEFORE UPDATE ON public.feature_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_enrollments BEFORE UPDATE ON public.course_enrollments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_completions BEFORE UPDATE ON public.lesson_completions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX memberships_class_idx ON public.class_memberships(class_id); CREATE INDEX assignments_class_idx ON public.class_assignments(class_id); CREATE INDEX submissions_assignment_idx ON public.assignment_submissions(assignment_id);
CREATE FUNCTION public.protect_class_fields() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN IF NEW.created_by<>OLD.created_by OR NEW.school_id IS DISTINCT FROM OLD.school_id THEN RAISE EXCEPTION 'Class ownership cannot change'; END IF; NEW.updated_at:=now(); RETURN NEW; END $$;
CREATE TRIGGER protect_class BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.protect_class_fields();

CREATE FUNCTION bridgelib_private.set_role(p_user_id uuid,p_role text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN IF NOT bridgelib_private.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF; IF p_role NOT IN ('student','teacher','school_admin','admin') THEN RAISE EXCEPTION 'Invalid role'; END IF; PERFORM pg_advisory_xact_lock(726441); IF bridgelib_private.has_role(p_user_id,'admin') AND p_role<>'admin' AND (SELECT count(*) FROM public.user_roles WHERE role='admin')<=1 THEN RAISE EXCEPTION 'The last administrator cannot be removed'; END IF; IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user_id) THEN RAISE EXCEPTION 'User not found'; END IF; DELETE FROM public.user_roles WHERE user_id=p_user_id; INSERT INTO public.user_roles(user_id,role) VALUES(p_user_id,p_role); UPDATE public.profiles SET role=p_role,updated_at=now() WHERE id=p_user_id; END $$;
CREATE FUNCTION public.set_user_role(p_user_id uuid,p_role text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT bridgelib_private.set_role(p_user_id,p_role) $$;
CREATE FUNCTION bridgelib_private.redeem_invite(p_code text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE inv public.class_invites; BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF; SELECT * INTO inv FROM public.class_invites WHERE code_hash=encode(extensions.digest(trim(p_code),'sha256'),'hex') FOR UPDATE; IF inv.id IS NULL OR inv.revoked_at IS NOT NULL OR inv.expires_at<=now() THEN RAISE EXCEPTION 'Invitation unavailable or expired'; END IF; IF EXISTS(SELECT 1 FROM public.class_memberships WHERE class_id=inv.class_id AND student_id=auth.uid() AND status='active') THEN RETURN inv.class_id; END IF; IF inv.use_count>=inv.max_uses THEN RAISE EXCEPTION 'Invitation use limit reached'; END IF; IF NOT EXISTS(SELECT 1 FROM public.classes WHERE id=inv.class_id AND status='active') THEN RAISE EXCEPTION 'Class unavailable'; END IF; INSERT INTO public.class_memberships(class_id,student_id) VALUES(inv.class_id,auth.uid()); UPDATE public.class_invites SET use_count=use_count+1 WHERE id=inv.id; RETURN inv.class_id; END $$;
CREATE FUNCTION public.redeem_class_invite(p_code text) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT bridgelib_private.redeem_invite(p_code) $$;
CREATE FUNCTION public.create_class_invite(p_class_id uuid,p_days integer DEFAULT 7,p_max_uses integer DEFAULT 100) RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE code text; BEGIN IF NOT public.is_class_teacher(p_class_id) THEN RAISE EXCEPTION 'Teacher access required'; END IF; IF p_days<1 OR p_days>30 OR p_max_uses<1 OR p_max_uses>1000 THEN RAISE EXCEPTION 'Invalid invitation limits'; END IF; code:=replace(gen_random_uuid()::text,'-',''); INSERT INTO public.class_invites(class_id,code_hash,created_by,expires_at,max_uses) VALUES(p_class_id,encode(extensions.digest(code,'sha256'),'hex'),auth.uid(),now()+make_interval(days=>p_days),p_max_uses); RETURN code; END $$;
CREATE FUNCTION public.save_exam_question(p_question jsonb,p_correct_option text,p_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ DECLARE qid uuid; BEGIN IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF; IF length(trim(p_question->>'prompt'))<1 OR length(p_question->>'prompt')>10000 OR jsonb_typeof(p_question->'options')<>'array' OR jsonb_array_length(p_question->'options')<>4 OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(p_question->'options') o WHERE o->>'id'=p_correct_option) OR EXISTS(SELECT 1 FROM jsonb_array_elements(p_question->'options') o WHERE length(trim(o->>'text'))<1) THEN RAISE EXCEPTION 'Invalid question or answer'; END IF; IF p_id IS NULL THEN INSERT INTO public.exam_questions(subject_id,prompt,options,explanation,exam_type,is_published,created_by) VALUES((p_question->>'subject_id')::bigint,trim(p_question->>'prompt'),p_question->'options',p_question->>'explanation',coalesce(p_question->>'exam_type','WASSCE'),coalesce((p_question->>'is_published')::boolean,false),auth.uid()) RETURNING id INTO qid; ELSE UPDATE public.exam_questions SET subject_id=(p_question->>'subject_id')::bigint,prompt=trim(p_question->>'prompt'),options=p_question->'options',explanation=p_question->>'explanation',exam_type=coalesce(p_question->>'exam_type','WASSCE'),is_published=coalesce((p_question->>'is_published')::boolean,false),updated_at=now() WHERE id=p_id RETURNING id INTO qid; END IF; IF qid IS NULL THEN RAISE EXCEPTION 'Question unavailable'; END IF; INSERT INTO public.exam_question_answers(question_id,correct_option,created_by) VALUES(qid,p_correct_option,auth.uid()) ON CONFLICT(question_id) DO UPDATE SET correct_option=excluded.correct_option; RETURN qid; END $$;
CREATE FUNCTION public.delete_exam_question(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ BEGIN IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF; DELETE FROM public.exam_question_answers WHERE question_id=p_id; DELETE FROM public.exam_questions WHERE id=p_id; END $$;
REVOKE ALL ON FUNCTION bridgelib_private.set_role(uuid,text),bridgelib_private.redeem_invite(text),public.set_user_role(uuid,text),public.redeem_class_invite(text),public.create_class_invite(uuid,integer,integer),public.save_exam_question(jsonb,text,uuid),public.delete_exam_question(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION bridgelib_private.set_role(uuid,text),bridgelib_private.redeem_invite(text),public.set_user_role(uuid,text),public.redeem_class_invite(text),public.create_class_invite(uuid,integer,integer),public.save_exam_question(jsonb,text,uuid),public.delete_exam_question(uuid) TO authenticated;

CREATE FUNCTION public.assign_student_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'student') ON CONFLICT DO NOTHING; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.assign_student_role() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER assign_student_role AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.assign_student_role();

-- Bookmarks, ratings, certificates, metrics, practice feedback
CREATE TABLE public.bridge_bookmarks (user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,subject_id));
GRANT SELECT,INSERT,DELETE ON public.bridge_bookmarks TO authenticated; GRANT ALL ON public.bridge_bookmarks TO service_role;
ALTER TABLE public.bridge_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_bookmarks ON public.bridge_bookmarks FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.bridge_ratings (user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE, rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), PRIMARY KEY(user_id,subject_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.bridge_ratings TO authenticated; GRANT ALL ON public.bridge_ratings TO service_role;
ALTER TABLE public.bridge_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_ratings ON public.bridge_ratings FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.course_enrollments e WHERE e.user_id=auth.uid() AND e.subject_id=bridge_ratings.subject_id));
CREATE TABLE public.bridge_certificates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, subject_id bigint NOT NULL REFERENCES public.subjects(id), learner_name text NOT NULL, subject_name text NOT NULL, issued_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,subject_id));
GRANT SELECT ON public.bridge_certificates TO authenticated; GRANT ALL ON public.bridge_certificates TO service_role;
ALTER TABLE public.bridge_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_certificates ON public.bridge_certificates FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.bridge_course_metrics() RETURNS TABLE(subject_id bigint,lesson_count bigint,student_count bigint,rating_count bigint,rating_average numeric) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT s.id,(SELECT count(*) FROM public.lessons l WHERE l.subject_id=s.id AND l.is_published),(SELECT count(*) FROM public.course_enrollments e WHERE e.subject_id=s.id),(SELECT count(*) FROM public.bridge_ratings r WHERE r.subject_id=s.id),(SELECT round(avg(r.rating),1) FROM public.bridge_ratings r WHERE r.subject_id=s.id) FROM public.subjects s; $$;
REVOKE ALL ON FUNCTION public.bridge_course_metrics() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.bridge_course_metrics() TO anon,authenticated;
CREATE FUNCTION public.bridge_issue_certificate(p_subject bigint) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE cid uuid; learner text; subject text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to continue.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.course_enrollments WHERE user_id=auth.uid() AND subject_id=p_subject) OR NOT EXISTS(SELECT 1 FROM public.lessons WHERE subject_id=p_subject AND is_published) OR EXISTS(SELECT 1 FROM public.lessons l WHERE l.subject_id=p_subject AND l.is_published AND NOT EXISTS(SELECT 1 FROM public.lesson_completions c WHERE c.lesson_id=l.id AND c.user_id=auth.uid())) THEN
 RAISE EXCEPTION 'Enroll and complete every published lesson before requesting your completion certificate.'; END IF;
 SELECT coalesce(nullif(full_name,''),'BridgeLIB learner') INTO learner FROM public.profiles WHERE id=auth.uid();
 SELECT name INTO subject FROM public.subjects WHERE id=p_subject;
 INSERT INTO public.bridge_certificates(user_id,subject_id,learner_name,subject_name) VALUES(auth.uid(),p_subject,coalesce(learner,'BridgeLIB learner'),subject) ON CONFLICT(user_id,subject_id) DO NOTHING;
 SELECT id INTO cid FROM public.bridge_certificates WHERE user_id=auth.uid() AND subject_id=p_subject; RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.bridge_issue_certificate(bigint) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.bridge_issue_certificate(bigint) TO authenticated;
CREATE FUNCTION public.bridge_my_certificates() RETURNS SETOF public.bridge_certificates LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT * FROM public.bridge_certificates WHERE user_id=auth.uid() ORDER BY issued_at DESC $$;
REVOKE ALL ON FUNCTION public.bridge_my_certificates() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.bridge_my_certificates() TO authenticated;
CREATE FUNCTION public.bridge_practice_feedback(p_question uuid,p_option text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to continue.'; END IF;
 SELECT jsonb_build_object('question_id',q.id,'correct_option',a.correct_option,'explanation',q.explanation,'is_correct',a.correct_option=p_option) INTO result FROM public.exam_questions q JOIN public.exam_question_answers a ON a.question_id=q.id WHERE q.id=p_question AND q.is_published AND EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) o WHERE o->>'id'=p_option);
 IF result IS NULL THEN RAISE EXCEPTION 'Question unavailable.'; END IF; RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.bridge_practice_feedback(uuid,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.bridge_practice_feedback(uuid,text) TO authenticated;

-- Account-saved study conversations
CREATE TABLE public.bridge_study_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, title text NOT NULL DEFAULT 'Study conversation', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,DELETE ON public.bridge_study_threads TO authenticated; GRANT ALL ON public.bridge_study_threads TO service_role;
ALTER TABLE public.bridge_study_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_study_threads ON public.bridge_study_threads FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.bridge_study_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), thread_id uuid NOT NULL REFERENCES public.bridge_study_threads(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, message_id text NOT NULL, message jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(thread_id,message_id));
GRANT SELECT,INSERT ON public.bridge_study_messages TO authenticated; GRANT ALL ON public.bridge_study_messages TO service_role;
ALTER TABLE public.bridge_study_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_study_messages_read ON public.bridge_study_messages FOR SELECT TO authenticated USING(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.bridge_study_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE POLICY own_study_messages_insert ON public.bridge_study_messages FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.bridge_study_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE INDEX bridge_study_messages_thread_time ON public.bridge_study_messages(thread_id,created_at);