import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {Link} from '@tanstack/react-router';
import {ArrowRight} from 'lucide-react';
import {publicCatalogue} from '@/lib/learning.functions';
import {SubjectIcon} from '@/components/site/SiteChrome';
import { featuredSubjectNames, referenceSubjects } from '@/lib/reference-features';
import { Button } from '@/components/ui/button';
import { CourseMetrics } from './CourseMetrics';
export function FeaturedCourses() {
 const fetchData=useServerFn(publicCatalogue);
 const q=useQuery({queryKey:['catalogue'],queryFn:()=>fetchData(),staleTime:30000});
 const subjects=referenceSubjects(q.data?.subjects??[]);
 return <section className="bl-container bl-section"><div className="bl-featured"><div className="bl-featured-head"><div><h2 className="bl-h2">Featured Courses &amp; Learning Resources</h2><p className="bl-muted">Access quality courses, past questions, and study materials tailored for Liberian students.</p></div><Link to="/courses" className="bl-link">View All Courses <ArrowRight size={16}/></Link></div><div className="bl-grid-3">{featuredSubjectNames.map(name=>{
  const subject=subjects.find(s=>s.name.toLowerCase()===name.toLowerCase());
  return <article key={name} className="bl-card bl-course"><SubjectIcon name={name}/><h3>{subject?.name??name}</h3><p>{subject?.description??(q.isPending?'Checking course availability…':q.isError?'Course availability could not be loaded.':'No published course content yet.')}</p>{subject?<><CourseMetrics subjectId={subject.id} featured/><Link to="/courses/$subjectId" params={{subjectId:String(subject.id)}} className="bl-btn bl-btn-primary bl-btn-sm">Start Course <ArrowRight size={14}/></Link></>:<><span className="bl-featured-unavailable">{q.isPending?'Loading…':'Not available yet'}</span><Button disabled className="bl-btn bl-btn-primary bl-btn-sm">Start Course <ArrowRight size={14}/></Button></>}</article>;
 })}</div></div></section>;
}
