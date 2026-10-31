import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { BookOpen, Star, Users } from 'lucide-react';
import { catalogueMetrics } from '@/lib/reference.functions';
export function useCourseMetrics() { const fetch=useServerFn(catalogueMetrics);return useQuery({queryKey:['course-metrics'],queryFn:()=>fetch(),staleTime:60000}); }
export function CourseMetrics({ subjectId, lessonsOnly = false, featured = false }: {subjectId:number;lessonsOnly?:boolean;featured?:boolean}) {
 const q=useCourseMetrics();const m=q.data?.metrics.find(x=>Number(x.subject_id)===subjectId);
 if(lessonsOnly) return <span className="bl-course-lesson-badge"><BookOpen size={13}/>{m ? m.lesson_count : '—'} Lessons</span>;
 if(featured) return <div className="bl-course-metrics bl-featured-metrics"><span><BookOpen size={12}/>{m?.lesson_count??'—'} Lessons</span><span><Users size={12}/>{m?Number(m.student_count).toLocaleString():'—'} Students</span></div>;
 return <div className="bl-course-metrics"><span title={m?'Enrolled learners':'Counts unavailable right now'}><Users size={14}/>{m?Number(m.student_count).toLocaleString():'—'} Students</span><span><Star size={15}/>{m?.rating_average ?? '—'} ({m?.rating_count ?? '—'})</span></div>;
}
