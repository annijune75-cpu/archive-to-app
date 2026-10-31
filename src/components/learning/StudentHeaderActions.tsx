import { useEffect,useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { Bell, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { workspaceData } from '@/lib/learning.functions';
import { unreadClassMessages } from '@/lib/student-class';
export function StudentHeaderActions(){
 const load=useServerFn(workspaceData);const q=useQuery({queryKey:['workspace'],queryFn:()=>load(),retry:false});const d=q.data;const [photo,setPhoto]=useState('');const [open,setOpen]=useState(false);
 useEffect(()=>{let live=true;void supabase.auth.getUser().then(async({data})=>{const path=data.user?.user_metadata['student_photo_path'];if(data.user&&typeof path==='string'&&path.startsWith(`${data.user.id}/`)){const r=await supabase.storage.from('student-photos').createSignedUrl(path,3600);if(live&&r.data)setPhoto(r.data.signedUrl);}});return()=>{live=false;};},[]);
 const unread=d?unreadClassMessages(d.messages,d.messageReads.map(r=>r.message_id),d.userId):[];
 return <div className="bl-student-actions"><Button className="bl-search-btn sc-bell" aria-label={`Notifications, ${unread.length} unread messages`} aria-expanded={open} onClick={()=>setOpen(!open)}><Bell size={18}/>{unread.length>0&&<span className="sc-unread">{unread.length}</span>}</Button><Link to="/profile" className="bl-header-profile">{photo?<img className="sc-profile-photo" src={photo} alt="Your profile"/>:<User size={22}/>}<span><strong>{d?.profile?.full_name??'Student'}</strong><small>Student</small></span><ChevronDown size={12}/></Link>{open&&<div className="bl-notifications"><strong>Notifications</strong>{unread.length?<Link to="/classroom" search={{tab:'messages',classId:''}} onClick={()=>setOpen(false)}>{unread.length} unread teacher {unread.length===1?'message':'messages'}</Link>:<p>No unread messages.</p>}<Link to="/classroom" search={{tab:'lessons',classId:''}} onClick={()=>setOpen(false)}>View class learning</Link></div>}</div>;
}