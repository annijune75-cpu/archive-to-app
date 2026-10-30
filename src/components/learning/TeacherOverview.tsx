import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Atom, BarChart3, BookOpen, Calculator, CheckCircle2, ClipboardCheck, ClipboardList, Download, FileText, FlaskConical, GraduationCap, House, Leaf, LogOut, MessageSquare, PlusCircle, Settings, User, UserPlus, Users } from 'lucide-react';
import { teacherOverview, greeting } from '@/lib/teacher-overview';
import type { workspaceData } from '@/lib/learning.functions';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LiberiaFlag } from '@/components/site/SiteChrome';
import heroPhoto from '@/assets/teacher-hero.jpg';
import supportPhoto from '@/assets/teacher-support.jpg';

type Data = Awaited<ReturnType<typeof workspaceData>>;

const jump = (id: string) => (e: React.MouseEvent) => { const el = document.getElementById(id); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

export function TeacherSidebar() {
  const [name, setName] = useState('Teacher'); const navigate = useNavigate();
  useEffect(() => { let live = true; void supabase.auth.getUser().then(async ({ data }) => { if (!data.user) return; const p = await supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle(); if (live) setName(p.data?.full_name || data.user.user_metadata['full_name'] || 'Teacher'); }); return () => { live = false; }; }, []);
  const items: [string, string, typeof House][] = [['top', 'Dashboard', House], ['t-courses', 'My Courses', BookOpen], ['create-class', 'Create Course', PlusCircle], ['classes', 'Create Assignment', ClipboardList], ['t-upcoming', 'Assignments', ClipboardCheck], ['t-progress', 'Student Progress', BarChart3], ['t-recent', 'Grading', FileText]];
  return <aside className="bl-pt-side" aria-label="Teacher menu"><div className="bl-pt-user"><span className="bl-pt-avatar"><User size={22} /></span><div><strong>{name}</strong><span>Teacher</span></div></div><nav>
    {items.map(([id, label, Icon], i) => <a key={id} href={`#${id}`} onClick={jump(id === 'top' ? 'teacher-top' : id)} className={i === 0 ? 'is-active' : ''}><Icon size={18} />{label}</a>)}
    <Link to="/certificates"><GraduationCap size={18} />Certificates</Link>
    <Link to="/downloads"><Download size={18} />Resources</Link>
    <Link to="/settings"><Settings size={18} />Settings</Link>
    <Button className="bl-side-logout" onClick={async () => { await supabase.auth.signOut(); await navigate({ to: '/' }); }}><LogOut size={18} />Logout</Button>
  </nav><div className="bl-pt-side-card"><LiberiaFlag size={80} /><strong>Educate Today,<br />Build Tomorrow.</strong><span>Better teachers.<br />Brighter Liberia.</span></div></aside>;
}

const tones = ['blue', 'red', 'green', 'purple', 'blue'];
function subjectIcon(name: string) { const n = name.toLowerCase(); return n.includes('math') ? Calculator : n.includes('english') || n.includes('literature') ? BookOpen : n.includes('bio') ? Leaf : n.includes('chem') ? FlaskConical : n.includes('phys') ? Atom : BookOpen; }
const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

function Head({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return <div className="tc-head"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action}</div>;
}

function LineChart({ s }: { s: ReturnType<typeof teacherOverview>['series'] }) {
  const max = Math.max(4, ...s.assignments, ...s.submissions, ...s.graded);
  const W = 320, H = 120, x = (i: number) => 24 + (i * (W - 34)) / 6, y = (v: number) => H - 14 - (v / max) * (H - 24);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  return <svg viewBox={`0 0 ${W} ${H + 12}`} className="tc-chart" role="img" aria-label="Activity over the last 7 days">
    {[0, 0.5, 1].map((f) => <g key={f}><line x1={24} x2={W - 10} y1={y(max * f)} y2={y(max * f)} className="grid" /><text x={18} y={y(max * f) + 3} textAnchor="end">{Math.round(max * f)}</text></g>)}
    {([['c1', s.submissions], ['c2', s.graded], ['c3', s.assignments]] as const).map(([c, arr]) => <g key={c} className={c}><path d={path(arr)} /> {arr.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.5} />)}</g>)}
    {s.days.map((d, i) => <text key={d} x={x(i)} y={H + 8} textAnchor="middle">{new Date(d + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>)}
  </svg>;
}

export function TeacherOverview({ d }: { d: Data }) {
  const o = teacherOverview(d);
  const name = (d.profile as { full_name?: string | null } | null)?.full_name?.trim();
  const subjectName = (id: number | null) => d.subjects.find((s) => s.id === id)?.name ?? 'General';
  const studentName = (id: string) => d.students.find((p) => p.id === id)?.full_name?.trim() || `Student ${id.slice(0, 4)}`;
  const { graded, awaiting, missing } = o.progress;
  const total = graded + awaiting + missing;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  const donut = total ? `conic-gradient(var(--chart-2) 0 ${pct(graded)}%, var(--chart-3) 0 ${pct(graded) + pct(awaiting)}%, var(--bl-red) 0 100%)` : 'var(--muted)';
  const activity = [
    ...d.assignments.map((a) => ({ id: a.id, date: a.created_at as string, icon: ClipboardList, tone: 'blue', text: <>You created an assignment: <b>{a.title}</b></> })),
    ...d.submissions.map((s) => ({ id: s.id, date: s.created_at as string, icon: FileText, tone: 'purple', text: <>{studentName(s.student_id)} submitted <b>{d.assignments.find((a) => a.id === s.assignment_id)?.title ?? 'an assignment'}</b></> })),
    ...d.memberships.filter((m) => m.status === 'active' && m.student_id !== d.userId).map((m) => ({ id: m.id, date: m.created_at as string, icon: UserPlus, tone: 'green', text: <>New student joined: <b>{studentName(m.student_id)}</b></> })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return <section className="tc" aria-label="Teacher overview" id="teacher-top">
    <div className="tc-hero"><img src={heroPhoto} alt="Liberian teacher with his students" width={1600} height={640} />
      <div className="tc-hero-copy"><h1>{greeting()}{name ? `, ${name}` : ''}!</h1><p>You're making a difference in the lives of Liberian students.<br />Keep inspiring and building a brighter future.</p>
        <div className="tc-hero-stats">{([[BookOpen, 'Courses', d.classes.length], [Users, 'Students', o.students], [ClipboardList, 'Assignments', d.assignments.length], [ClipboardCheck, 'To grade', awaiting]] as const).map(([I, l, v]) => <span key={l}><i><I size={18} /></i><b><small>{l}</small>{v}</b></span>)}</div></div>
      <div className="tc-hero-tag">Quality<br />Education<br />for a Stronger<br />Liberia</div></div>

    <div className="tc-cols">
      <div className="tc-main">
        <article className="tc-card" id="t-courses"><Head title="My Courses" sub="Manage your courses and track student progress." action={<a href="#create-class" onClick={jump('create-class')} className="bl-btn bl-btn-primary bl-btn-sm"><PlusCircle size={14} /> Create Course</a>} />
          {o.classStats.length === 0 ? <p className="tc-empty">You have no courses yet. Create one to start inviting students.</p> : <ul className="tc-courses">{o.classStats.map((c, i) => { const I = subjectIcon(subjectName(c.subject_id)); return <li key={c.id}><span className={`tc-ico ${tones[i % 5]}`}><I size={20} /></span><div className="tc-cname"><b>{c.name}</b><small>{c.students} student{c.students === 1 ? '' : 's'} · {subjectName(c.subject_id)}</small></div><div className="tc-meter"><div><i style={{ width: `${c.submissionRate ?? 0}%` }} /></div><small>{c.submissionRate === null ? '—' : `${c.submissionRate}%`}</small></div><a href="#classes" onClick={jump('classes')} className="tc-out">View Students</a><a href="#classes" onClick={jump('classes')} className="tc-out">Manage</a></li>; })}</ul>}
          {o.classStats.length > 0 && <p className="tc-note">Bars show the share of assignments students have submitted.</p>}
        </article>

        <div className="tc-row">
          <article className="tc-card" id="t-progress"><Head title="Student Progress Overview" />
            <div className="tc-prog"><div>{total === 0 ? <p className="tc-empty">No assignment activity yet.</p> : <div className="tc-donut-wrap"><div className="tc-donut" style={{ background: donut }} role="img" aria-label={`${graded} graded, ${awaiting} awaiting grading, ${missing} not submitted`}><span><b>{total}</b><small>Total Tasks</small></span></div>
              <ul className="tc-legend"><li><i className="k1" />Graded <em>{Math.round(pct(graded))}% ({graded})</em></li><li><i className="k2" />Awaiting <em>{Math.round(pct(awaiting))}% ({awaiting})</em></li><li><i className="k3" />Not submitted <em>{Math.round(pct(missing))}% ({missing})</em></li></ul></div>}</div>
              <div className="tc-top"><h3>Top Performing Students</h3>{o.topStudents.length === 0 ? <p className="tc-empty">Appears after you grade work.</p> : <ol>{o.topStudents.map((s, i) => <li key={s.student_id}><span className="tc-av">{initials(studentName(s.student_id))}</span>{i + 1}. {studentName(s.student_id)}<b>{s.average}%</b></li>)}</ol>}</div></div>
          </article>
          <article className="tc-card" id="t-upcoming"><Head title="Upcoming Assignments" />
            {o.upcoming.length === 0 ? <p className="tc-empty">No assignments with an upcoming due date.</p> : <ul className="tc-up">{o.upcoming.slice(0, 4).map((a) => <li key={a.id}><ClipboardList size={16} /><div><b>{d.classes.find((c) => c.id === a.class_id)?.name ?? 'Class'} – {a.title}</b><small>Due: {new Date(a.due_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><em className={a.urgency}>{a.urgency === 'soon' ? 'Due soon' : a.urgency === 'week' ? 'This week' : 'Later'}</em></li>)}</ul>}
          </article>
        </div>

        <div className="tc-row">
          <article className="tc-card"><Head title="Recent Activity" />
            {activity.length === 0 ? <p className="tc-empty">No activity yet.</p> : <ul className="tc-act">{activity.map((a) => <li key={a.id}><span className={`tc-ico sm ${a.tone}`}><a.icon size={14} /></span><div><p>{a.text}</p><small>{new Date(a.date).toLocaleString()}</small></div></li>)}</ul>}
          </article>
          <article className="tc-card" id="t-analytics"><Head title="Course Analytics" action={<span className="tc-pill">Last 7 days</span>} />
            <ul className="tc-keys"><li><i className="c1" />Submissions</li><li><i className="c2" />Graded</li><li><i className="c3" />Assignments Created</li></ul>
            <LineChart s={o.series} />
          </article>
        </div>
      </div>

      <aside className="tc-side">
        <article className="tc-card"><Head title="Quick Actions" /><div className="tc-quick">{([['create-class', 'Create Course', 'Add a new course', PlusCircle, 'blue'], ['classes', 'Create Assignment', 'Pick a class first', ClipboardList, 'red'], ['classes', 'Invite Students', 'Share a class code', UserPlus, 'green'], ['classes', 'Manage Students', 'View class members', Users, 'purple'], ['t-recent', 'Grade Work', 'Review submissions', CheckCircle2, 'orange'], ['t-analytics', 'View Reports', 'Check performance', BarChart3, 'teal']] as const).map(([id, t, s, I, tone]) => <a key={t} href={`#${id}`} onClick={jump(id)}><span className={`tc-ico ${tone}`}><I size={18} /></span><div><b>{t}</b><small>{s}</small></div></a>)}</div></article>
        <article className="tc-card" id="t-recent"><Head title="Recent Submissions" />
          {o.recent.length === 0 ? <p className="tc-empty">No student work submitted yet. BridgeLIB has no messaging, so new submissions appear here.</p> : <ul className="tc-msgs">{o.recent.map((s) => { const a = d.assignments.find((x) => x.id === s.assignment_id); const n = studentName(s.student_id); return <li key={s.assignment_id + s.student_id}><span className="tc-av lg">{initials(n)}</span><div><b>{n} <small>(Student)</small></b><p>{a?.title ?? 'Assignment'}</p></div><div className="tc-msg-meta"><small>{new Date(s.created_at).toLocaleDateString()}</small>{s.score === null ? <em>Needs grading</em> : <b>{s.score}/{a?.max_score ?? '?'}</b>}</div></li>; })}</ul>}
        </article>
        <article className="tc-support"><img src={supportPhoto} alt="Teacher helping students with their work" width={784} height={848} loading="lazy" /><div><h3>Great Teachers<br />Build Great<br />Futures</h3><Link to="/downloads" className="bl-btn bl-btn-red bl-btn-sm">View Support Resources <ArrowRight size={14} /></Link></div></article>
      </aside>
    </div>
    <span hidden><MessageSquare /></span>
  </section>;
}
