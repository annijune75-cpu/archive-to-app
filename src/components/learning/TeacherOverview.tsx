import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Atom, Bell, Camera, Trash2, BadgeCheck, BarChart3, ChevronDown, MoreVertical, Mail, PlayCircle, FileQuestion, Upload, BookOpen, Calculator, ClipboardList, Download, FileText, FlaskConical, GraduationCap, House, Leaf, LogOut, PlusCircle, Settings, User, UserPlus, Users } from 'lucide-react';
import { teacherOverview, greeting } from '@/lib/teacher-overview';
import type { teacherAction, workspaceData } from '@/lib/learning.functions';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LiberiaFlag } from '@/components/site/SiteChrome';
import heroPhoto from '@/assets/teacher-hero.jpg';
import supportPhoto from '@/assets/teacher-support.jpg';

type Data = Awaited<ReturnType<typeof workspaceData>>;

const jump = (id: string) => (e: React.MouseEvent) => { const el = document.getElementById(id); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

function useTeacherProfile() {
  const [name, setName] = useState('Teacher'); const [photo, setPhoto] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { let live = true; void supabase.auth.getUser().then(async ({ data }) => { if (!data.user) return; const p = await supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle(); if (!live) return; setName(p.data?.full_name || data.user.user_metadata['full_name'] || 'Teacher'); const path = data.user.user_metadata['student_photo_path']; if (typeof path === 'string' && path.startsWith(`${data.user.id}/`)) { const u = await supabase.storage.from('student-photos').createSignedUrl(path, 3600); if (live && u.data) setPhoto(u.data.signedUrl); } }); const on = (e: Event) => setPhoto((e as CustomEvent<string>).detail); window.addEventListener('tc-photo', on); return () => { live = false; window.removeEventListener('tc-photo', on); }; }, []);
  async function upload(file: File) {
    setErr(''); if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setErr('Use a JPG, PNG or WebP photo under 5 MB.'); return; }
    const { data } = await supabase.auth.getUser(); if (!data.user) return;
    const path = `${data.user.id}/profile.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`;
    const up = await supabase.storage.from('student-photos').upload(path, file, { upsert: true }); if (up.error) { setErr('Photo could not be uploaded.'); return; }
    await supabase.auth.updateUser({ data: { student_photo_path: path } });
    const u = await supabase.storage.from('student-photos').createSignedUrl(path, 3600); if (u.data) { setPhoto(u.data.signedUrl); window.dispatchEvent(new CustomEvent('tc-photo', { detail: u.data.signedUrl })); }
  }
  async function remove() {
    setErr(''); const { data } = await supabase.auth.getUser(); if (!data.user) return;
    const path = data.user.user_metadata['student_photo_path'];
    if (typeof path === 'string' && path.startsWith(`${data.user.id}/`)) { const r = await supabase.storage.from('student-photos').remove([path]); if (r.error) { setErr('Photo could not be removed.'); return; } }
    await supabase.auth.updateUser({ data: { student_photo_path: null } });
    setPhoto(''); window.dispatchEvent(new CustomEvent('tc-photo', { detail: '' }));
  }
  return { name, photo, upload, remove, err };
}

function Avatar({ photo, name, size }: { photo: string; name: string; size: number }) {
  return photo ? <img src={photo} alt={name} width={size} height={size} className="tc-photo" style={{ width: size, height: size }} /> : <span className="tc-photo tc-photo-empty" style={{ width: size, height: size }}><User size={size / 2} /></span>;
}

export function TeacherHeaderActions({ d }: { d?: Data | undefined }) {
  const { name, photo } = useTeacherProfile(); const [open, setOpen] = useState(false);
  const unread = d ? d.messages.filter((m) => m.sender_id !== d.userId && !m.read_at) : [];
  const toGrade = d ? d.submissions.filter((s) => s.score === null).length : 0;
  const count = unread.length + (toGrade ? 1 : 0);
  return <div className="bl-student-actions"><Button className="bl-search-btn tc-bell" aria-label={`Notifications${count ? ` (${count} new)` : ''}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}><Bell size={18} />{count > 0 && <i className="tc-bell-dot" />}</Button>
    <a href="#teacher-top" className="bl-header-profile"><Avatar photo={photo} name={name} size={36} /><span><strong>{name}</strong><small>Teacher</small></span></a>
    {open && <div className="bl-notifications"><strong>Notifications</strong>{count === 0 && <span className="tc-empty">You're all caught up.</span>}{unread.slice(0, 5).map((m) => <a key={m.id} href="#t-messages" onClick={(e) => { setOpen(false); jump('t-messages')(e); }}>New message: {m.body.slice(0, 60)}</a>)}{toGrade > 0 && <a href="#t-recent" onClick={(e) => { setOpen(false); jump('t-recent')(e); }}>{toGrade} submission{toGrade === 1 ? '' : 's'} to grade</a>}</div>}
  </div>;
}

export function TeacherSidebar({ d }: { d?: Data | undefined }) {
  const { name, photo, upload, remove, err } = useTeacherProfile();
  const unread = d ? d.messages.filter((m) => m.sender_id !== d.userId && !m.read_at).length : 0; const navigate = useNavigate();
  const items: [string, string, typeof House][] = [['top', 'Dashboard', House], ['t-courses', 'My Courses', BookOpen], ['create-class', 'Create Course', PlusCircle], ['t-create', 'Create Lesson', PlayCircle], ['t-create', 'Create Quiz', FileQuestion], ['t-upcoming', 'Assignments', ClipboardList], ['t-progress', 'Student Progress', BarChart3], ['t-recent', 'Grading', FileText], ['t-messages', 'Messages', Mail]];
  return <aside className="bl-pt-side" aria-label="Teacher menu"><div className="bl-pt-user"><label className="tc-photo-pick" title="Change profile photo"><Avatar photo={photo} name={name} size={56} /><i><Camera size={12} /></i><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload profile photo" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} /></label><div><strong>{name}</strong><span>Teacher</span><em className="tc-badge"><BadgeCheck size={12} />Verification pending</em>{photo && <button type="button" className="tc-linkbtn tc-rm" onClick={() => void remove()}>Remove photo</button>}{err && <small role="alert">{err}</small>}</div></div><nav>
    {items.map(([id, label, Icon], i) => <a key={label} href={`#${id}`} onClick={jump(id === 'top' ? 'teacher-top' : id)} className={i === 0 ? 'is-active' : ''}><Icon size={18} />{label}{label === 'Messages' && unread > 0 && <em className="tc-count" aria-label={`${unread} unread`}>{unread}</em>}</a>)}
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

type Save = (data: NonNullable<Parameters<typeof teacherAction>[0]>['data'], ok: string) => Promise<void>;

function ContentBuilder({ d, save, busy }: { d: Data; save: Save; busy: boolean }) {
  const [kind, setKind] = useState<'lesson' | 'quiz' | 'resource'>('lesson');
  const [qs, setQs] = useState([{ q: '', options: ['', '', '', ''], answer: 0 }]); const [err, setErr] = useState(''); const [all, setAll] = useState(false);
  async function openFile(path: string) { const u = await supabase.storage.from('class-resources').createSignedUrl(path, 600); if (u.data) window.open(u.data.signedUrl, '_blank', 'noopener'); else setErr('File could not be opened.'); }
  const count = (k: string) => d.content.filter((c) => c.kind === k).length;
  if (d.classes.length === 0) return <p className="tc-empty">Create a course first, then add lessons, quizzes and resources to it.</p>;
  return <>
    <ul className="tc-keys"><li><PlayCircle size={14} /> Lessons: {count('lesson')}</li><li><FileQuestion size={14} /> Quizzes: {count('quiz')}</li><li><Upload size={14} /> Resources: {count('resource')}</li></ul>
    <div className="tc-tabs" role="tablist">{(['lesson', 'quiz', 'resource'] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? 'is-on' : ''} onClick={() => setKind(k)}>{k === 'lesson' ? 'Create Lesson' : k === 'quiz' ? 'Create Quiz' : 'Upload Resource'}</button>)}</div>
    <form className="tc-form" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const el = e.currentTarget; const link = String(f.get('link') || '').trim();
      const file = f.get('file'); const classId = String(f.get('class'));
      void (async () => { let file_path: string | undefined;
        if (kind === 'resource') { if (file instanceof File && file.size > 0) { if (file.size > 20 * 1024 * 1024) { setErr('Files must be 20 MB or smaller.'); return; } const path = `${classId}/${crypto.randomUUID().slice(0, 8)}-${file.name.replace(/[^\w.-]+/g, '_').slice(-120)}`; const up = await supabase.storage.from('class-resources').upload(path, file); if (up.error) { setErr('The file could not be uploaded.'); return; } file_path = path; } else if (!link) { setErr('Choose a file or add a link.'); return; } }
        setErr('');
        await save({ kind: 'content', value: { file_path, class_id: classId, kind, title: String(f.get('title')), body: String(f.get('body') || '') || undefined, link_url: link || undefined, questions: kind === 'quiz' ? qs.map((q) => ({ ...q, options: q.options.filter(Boolean) })) : undefined } }, `${kind === 'lesson' ? 'Lesson' : kind === 'quiz' ? 'Quiz' : 'Resource'} saved.`); el.reset(); setQs([{ q: '', options: ['', '', '', ''], answer: 0 }]); })(); }}>
      {err && <p className="tc-err" role="alert">{err}</p>}
      <label>Course<select name="class" required>{d.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Title<input name="title" required maxLength={200} /></label>
      {kind !== 'quiz' && <label>{kind === 'lesson' ? 'Lesson content' : 'Description'}<textarea name="body" rows={4} maxLength={20000} required={kind === 'lesson'} /></label>}
      {kind === 'resource' && <><label>Upload file (PDF, Word, image — up to 20 MB)<input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*" /></label><label>…or a link (https://…)<input name="link" type="url" pattern="https?://.+" /></label></>}
      {kind === 'quiz' && qs.map((q, i) => <fieldset key={i} className="tc-q"><legend>Question {i + 1}</legend>
        <input aria-label={`Question ${i + 1}`} required value={q.q} onChange={(e) => setQs(qs.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
        {q.options.map((o, k) => <label key={k} className="tc-opt"><input type="radio" name={`ans${i}`} checked={q.answer === k} onChange={() => setQs(qs.map((x, j) => j === i ? { ...x, answer: k } : x))} aria-label="Correct answer" /><input aria-label={`Option ${k + 1}`} required={k < 2} value={o} onChange={(e) => setQs(qs.map((x, j) => j === i ? { ...x, options: x.options.map((y, m) => m === k ? e.target.value : y) } : x))} /></label>)}
      </fieldset>)}
      {kind === 'quiz' && <Button type="button" variant="outline" onClick={() => setQs([...qs, { q: '', options: ['', '', '', ''], answer: 0 }])}>Add question</Button>}
      <Button disabled={busy}>Save</Button>
    </form>
    {d.content.length === 0 ? <p className="tc-empty">Nothing created yet.</p> : <ul className="tc-up">{d.content.slice(0, all ? undefined : 5).map((c) => <li key={c.id}>{c.kind === 'quiz' ? <FileQuestion size={16} /> : c.kind === 'lesson' ? <PlayCircle size={16} /> : <Upload size={16} />}<div><b>{c.title}</b><small>{d.classes.find((x) => x.id === c.class_id)?.name} · {c.kind}{c.link_url ? <> · <a href={c.link_url} target="_blank" rel="noreferrer">Open link</a></> : null}{c.file_path ? <> · <button type="button" className="tc-linkbtn" onClick={() => void openFile(c.file_path!)}>Open file</button></> : null}{c.kind === 'quiz' && Array.isArray(c.questions) ? ` · ${c.questions.length} question${c.questions.length === 1 ? '' : 's'}` : ''}</small></div><button type="button" className="tc-kebab" aria-label={`Delete ${c.title}`} onClick={() => { if (confirm(`Delete "${c.title}"?`)) void (async () => { if (c.file_path) await supabase.storage.from('class-resources').remove([c.file_path]); await save({ kind: 'delete_content', id: c.id }, 'Deleted.'); })(); }}><Trash2 size={14} /></button></li>)}</ul>}
    {d.content.length > 5 && <button type="button" className="tc-linkbtn" onClick={() => setAll(!all)}>{all ? 'Show less' : `View all ${d.content.length}`}</button>}
  </>;
}

function Messages({ d, save, busy, name, all }: { d: Data; save: Save; busy: boolean; name: (id: string) => string; all: boolean }) {
  const inbox = d.messages.filter((m) => all || m.sender_id !== d.userId).slice(0, all ? 50 : 4);
  return <>
    {inbox.length === 0 ? <p className="tc-empty">No messages yet. Messages from your students will appear here.</p> : <ul className="tc-msgs">{inbox.map((m) => <li key={m.id}><span className="tc-av lg">{initials(name(m.sender_id))}</span><div><b>{m.sender_id === d.userId ? 'You' : name(m.sender_id)} <small>{m.sender_id === d.userId ? `→ ${d.classes.find((c) => c.id === m.class_id)?.name ?? 'class'}` : '(Student)'}</small></b><p>{m.body}</p></div><div className="tc-msg-meta"><small>{new Date(m.created_at).toLocaleDateString()}</small>{!m.read_at && m.sender_id !== d.userId && <button type="button" className="tc-dot" aria-label="Mark as read" onClick={() => void save({ kind: 'read', id: m.id }, 'Marked as read.')} />}</div></li>)}</ul>}
    {d.classes.length > 0 && <form className="tc-form" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const el = e.currentTarget; void save({ kind: 'message', value: { class_id: String(f.get('class')), recipient_id: null, body: String(f.get('body')) } }, 'Message sent to the class.').then(() => el.reset()); }}>
      <label>Send to class<select name="class">{d.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Message<textarea name="body" rows={2} required maxLength={2000} /></label><Button disabled={busy}>Send</Button></form>}
  </>;
}

function ViewAll({ on, set, label = 'View All' }: { on: boolean; set: (v: boolean) => void; label?: string }) {
  return <button type="button" className="tc-link" aria-expanded={on} onClick={() => set(!on)}>{on ? 'Show less' : label} <ArrowRight size={13} /></button>;
}

function CourseMenu({ id, save, label }: { id: string; save: Save; label: React.ReactNode }) {
  return <details className="tc-menu"><summary className={label ? 'tc-out' : 'tc-kebab'} aria-label={label ? undefined : 'More options'}>{label ?? <MoreVertical size={16} />}</summary><div onClick={(e) => { (e.currentTarget.parentElement as HTMLDetailsElement).open = false; }}>
    <a href="#classes" onClick={jump('classes')}>View students & assignments</a>
    <button type="button" onClick={() => void save({ kind: 'invite', class_id: id, days: 7, max_uses: 100 }, 'Invitation created.')}>Create invitation code</button>
    <a href="#t-create" onClick={jump('t-create')}>Add lesson, quiz or resource</a>
    <button type="button" onClick={() => { if (confirm('Archive this course?')) void save({ kind: 'archive', id }, 'Course archived.'); }}>Archive course</button>
  </div></details>;
}

export function TeacherOverview({ d, save, busy }: { d: Data; save: Save; busy: boolean }) {
  const o = teacherOverview(d);
  const [more, setMore] = useState<Record<string, boolean>>({}); const tog = (k: string) => (v: boolean) => setMore({ ...more, [k]: v });
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
  ].sort((a, b) => b.date.localeCompare(a.date));

  return <section className="tc" aria-label="Teacher overview" id="teacher-top">
    <div className="tc-hero"><img src={heroPhoto} alt="Liberian teacher with his students" width={1600} height={640} />
      <div className="tc-hero-copy"><h1>{greeting()}{name ? `, ${name}` : ''}!</h1><p>You're making a difference in the lives of Liberian students.<br />Keep inspiring and building a brighter future.</p>
        <div className="tc-hero-stats">{([[BookOpen, 'Courses', d.classes.length], [Users, 'Students', o.students], [ClipboardList, 'Assignments', d.assignments.length], [FileQuestion, 'Quizzes', d.content.filter((c) => c.kind === 'quiz').length]] as const).map(([I, l, v]) => <span key={l}><i><I size={18} /></i><b><small>{l}</small>{v}</b></span>)}</div></div>
      <div className="tc-hero-tag">Quality<br />Education<br />for a Stronger<br />Liberia</div></div>

    <div className="tc-cols">
      <div className="tc-main">
        <article className="tc-card" id="t-courses"><Head title="My Courses" sub="Manage your courses and track student progress." action={<a href="#create-class" onClick={jump('create-class')} className="bl-btn bl-btn-primary bl-btn-sm"><PlusCircle size={14} /> Create Course</a>} />
          {o.classStats.length === 0 ? <p className="tc-empty">You have no courses yet. Create one to start inviting students.</p> : <ul className="tc-courses">{o.classStats.map((c, i) => { const I = subjectIcon(subjectName(c.subject_id)); return <li key={c.id}><span className={`tc-ico ${tones[i % 5]}`}><I size={20} /></span><div className="tc-cname"><b>{c.name}</b><small>{c.students} student{c.students === 1 ? '' : 's'} · {subjectName(c.subject_id)}</small></div><div className="tc-meter"><div><i style={{ width: `${c.submissionRate ?? 0}%` }} /></div><small>{c.submissionRate === null ? '—' : `${c.submissionRate}%`}</small></div><a href="#classes" onClick={jump('classes')} className="tc-out">View Students</a><CourseMenu id={c.id} save={save} label={<>Manage <ChevronDown size={13} /></>} /><CourseMenu id={c.id} save={save} label={null} /></li>; })}</ul>}
          {o.classStats.length > 0 && <p className="tc-note">Bars show the share of assignments students have submitted.</p>}
        </article>

        <div className="tc-row">
          <article className="tc-card" id="t-progress"><Head title="Student Progress Overview" action={<ViewAll on={!!more['p']} set={tog('p')} label="View All Progress" />} />
            <div className="tc-prog"><div>{total === 0 ? <p className="tc-empty">No assignment activity yet.</p> : <div className="tc-donut-wrap"><div className="tc-donut" style={{ background: donut }} role="img" aria-label={`${graded} graded, ${awaiting} awaiting grading, ${missing} not submitted`}><span><b>{total}</b><small>Total Tasks</small></span></div>
              <ul className="tc-legend"><li><i className="k1" />Graded <em>{Math.round(pct(graded))}% ({graded})</em></li><li><i className="k2" />Awaiting <em>{Math.round(pct(awaiting))}% ({awaiting})</em></li><li><i className="k3" />Not submitted <em>{Math.round(pct(missing))}% ({missing})</em></li></ul></div>}</div>
              <div className="tc-top"><h3>Top Performing Students</h3>{o.topStudents.length === 0 ? <p className="tc-empty">Appears after you grade work.</p> : <ol>{o.topStudents.map((s, i) => <li key={s.student_id}><span className="tc-av">{initials(studentName(s.student_id))}</span>{i + 1}. {studentName(s.student_id)}<b>{s.average}%</b></li>)}</ol>}</div></div>
          </article>
          <article className="tc-card" id="t-upcoming"><Head title="Upcoming Assignments" action={<ViewAll on={!!more['u']} set={tog('u')} />} />
            {o.upcoming.length === 0 ? <p className="tc-empty">No assignments with an upcoming due date.</p> : <ul className="tc-up">{o.upcoming.slice(0, more['u'] ? undefined : 4).map((a) => <li key={a.id}><ClipboardList size={16} /><div><b>{d.classes.find((c) => c.id === a.class_id)?.name ?? 'Class'} – {a.title}</b><small>Due: {new Date(a.due_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><em className={a.urgency}>{a.urgency === 'soon' ? 'Due soon' : a.urgency === 'week' ? 'This week' : 'Later'}</em></li>)}</ul>}
          </article>
        </div>

        <div className="tc-row">
          <article className="tc-card"><Head title="Recent Activity" action={<ViewAll on={!!more['a']} set={tog('a')} />} />
            {activity.length === 0 ? <p className="tc-empty">No activity yet.</p> : <ul className="tc-act">{activity.slice(0, more['a'] ? 20 : 4).map((a) => <li key={a.id}><span className={`tc-ico sm ${a.tone}`}><a.icon size={14} /></span><div><p>{a.text}</p><small>{new Date(a.date).toLocaleString()}</small></div></li>)}</ul>}
          </article>
          <article className="tc-card" id="t-analytics"><Head title="Course Analytics" action={<span className="tc-pill">Last 7 days</span>} />
            <ul className="tc-keys"><li><i className="c1" />Submissions</li><li><i className="c2" />Graded</li><li><i className="c3" />Assignments Created</li></ul>
            <LineChart s={o.series} />
          </article>
        </div>
      </div>

      <aside className="tc-side">
        <article className="tc-card"><Head title="Quick Actions" /><div className="tc-quick">{([['create-class', 'Create Course', 'Add a new course', BookOpen, 'blue'], ['t-create', 'Create Lesson', 'Add lesson content', PlayCircle, 'red'], ['t-create', 'Create Quiz', 'Build assessments', FileQuestion, 'green'], ['classes', 'Manage Students', 'View & support learners', Users, 'purple'], ['t-create', 'Upload Resources', 'Add study materials', Upload, 'orange'], ['t-analytics', 'View Reports', 'Check performance', BarChart3, 'teal']] as const).map(([id, t, s, I, tone]) => <a key={t} href={`#${id}`} onClick={jump(id)}><span className={`tc-ico ${tone}`}><I size={18} /></span><div><b>{t}</b><small>{s}</small></div></a>)}</div></article>
        <article className="tc-card" id="t-messages"><Head title="Recent Messages" action={<ViewAll on={!!more['m']} set={tog('m')} />} />
          <Messages d={d} save={save} busy={busy} name={studentName} all={!!more['m']} />
        </article>
        <article className="tc-card" id="t-create"><Head title="Lessons, Quizzes & Resources" />
          <ContentBuilder d={d} save={save} busy={busy} />
        </article>
        <article className="tc-card" id="t-recent"><Head title="Recent Submissions" />
          {o.recent.length === 0 ? <p className="tc-empty">No student work submitted yet.</p> : <ul className="tc-msgs">{o.recent.map((s) => { const a = d.assignments.find((x) => x.id === s.assignment_id); const n = studentName(s.student_id); return <li key={s.assignment_id + s.student_id}><span className="tc-av lg">{initials(n)}</span><div><b>{n} <small>(Student)</small></b><p>{a?.title ?? 'Assignment'}</p></div><div className="tc-msg-meta"><small>{new Date(s.created_at).toLocaleDateString()}</small>{s.score === null ? <em>Needs grading</em> : <b>{s.score}/{a?.max_score ?? '?'}</b>}</div></li>; })}</ul>}
        </article>
        <article className="tc-support"><img src={supportPhoto} alt="Teacher helping students with their work" width={784} height={848} loading="lazy" /><div><h3>Great Teachers<br />Build Great<br />Futures</h3><Link to="/downloads" className="bl-btn bl-btn-red bl-btn-sm">View Support Resources <ArrowRight size={14} /></Link></div></article>
      </aside>
    </div>
  </section>;
}

