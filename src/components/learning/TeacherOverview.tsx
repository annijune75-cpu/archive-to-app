import { BarChart3, BookOpen, CalendarClock, ClipboardList, MessageSquare, Users } from 'lucide-react';
import { teacherOverview, greeting } from '@/lib/teacher-overview';
import type { workspaceData } from '@/lib/learning.functions';

type Data = Awaited<ReturnType<typeof workspaceData>>;

function Empty({ text }: { text: string }) {
  return <p className="bl-muted bl-t-empty">{text}</p>;
}

export function TeacherOverview({ d }: { d: Data }) {
  const o = teacherOverview(d);
  const name = (d.profile as { full_name?: string | null } | null)?.full_name?.trim();
  const subjectName = (id: number | null) => d.subjects.find((s) => s.id === id)?.name ?? 'General';
  const { graded, awaiting, missing } = o.progress;
  const total = graded + awaiting + missing;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  const donut = total
    ? `conic-gradient(var(--primary) 0 ${pct(graded)}%, var(--accent-foreground, var(--secondary)) 0 ${pct(graded) + pct(awaiting)}%, var(--muted) 0 100%)`
    : 'var(--muted)';

  return (
    <section className="bl-teacher" aria-label="Teacher overview">
      <div className="bl-t-banner">
        <div>
          <h2>{greeting()}{name ? `, ${name}` : ''}!</h2>
          <p>Here is what's happening in your classes today.</p>
        </div>
      </div>

      <div className="bl-grid-4 bl-mt">
        {[
          [BookOpen, 'My classes', d.classes.length],
          [Users, 'Students', o.students],
          [ClipboardList, 'Assignments', d.assignments.length],
          [CalendarClock, 'To grade', awaiting],
        ].map(([Icon, label, value]) => {
          const I = Icon as typeof BookOpen;
          return <article className="bl-card bl-stat" key={label as string}><I size={20} /><small>{label as string}</small><b>{value as number}</b></article>;
        })}
      </div>

      <div className="bl-t-grid bl-mt">
        <article className="bl-card">
          <h3 className="bl-t-h">My courses</h3>
          {o.classStats.length === 0 ? <Empty text="You have no classes yet. Create one below to start inviting students." /> : (
            <ul className="bl-t-list">{o.classStats.map((c) => (
              <li key={c.id}><div><b>{c.name}</b><small>{subjectName(c.subject_id)} · {c.status}</small></div><span>{c.students} student{c.students === 1 ? '' : 's'} · {c.assignments} assignment{c.assignments === 1 ? '' : 's'}</span></li>
            ))}</ul>
          )}
        </article>

        <article className="bl-card">
          <h3 className="bl-t-h">Student progress</h3>
          {total === 0 ? <Empty text="No assignment activity yet. Progress appears once students are given assignments." /> : (
            <div className="bl-t-donut-wrap">
              <div className="bl-t-donut" style={{ background: donut }} role="img" aria-label={`${graded} graded, ${awaiting} awaiting grading, ${missing} not submitted`}><span>{Math.round(pct(graded + awaiting))}%<small>submitted</small></span></div>
              <ul className="bl-t-legend">
                <li><i className="k1" />Graded <b>{graded}</b></li>
                <li><i className="k2" />Awaiting grading <b>{awaiting}</b></li>
                <li><i className="k3" />Not submitted <b>{missing}</b></li>
              </ul>
            </div>
          )}
        </article>

        <article className="bl-card">
          <h3 className="bl-t-h">Upcoming assignments</h3>
          {o.upcoming.length === 0 ? <Empty text="No assignments with an upcoming due date." /> : (
            <ul className="bl-t-list">{o.upcoming.slice(0, 5).map((a) => (
              <li key={a.id}><div><b>{a.title}</b><small>{d.classes.find((c) => c.id === a.class_id)?.name ?? 'Class'}</small></div><span>Due {new Date(a.due_at!).toLocaleDateString()}</span></li>
            ))}</ul>
          )}
        </article>

        <article className="bl-card">
          <h3 className="bl-t-h"><MessageSquare size={16} /> Recent submissions</h3>
          {o.recent.length === 0 ? <Empty text="No student work submitted yet. Messaging is not part of BridgeLIB yet, so student submissions are shown here instead." /> : (
            <ul className="bl-t-list">{o.recent.map((s) => {
              const a = d.assignments.find((x) => x.id === s.assignment_id);
              return <li key={s.assignment_id + s.student_id}><div><b>{a?.title ?? 'Assignment'}</b><small>{new Date(s.created_at).toLocaleString()}</small></div><span>{s.score === null ? 'Needs grading' : `${s.score}/${a?.max_score ?? '?'}`}</span></li>;
            })}</ul>
          )}
        </article>

        <article className="bl-card bl-t-wide">
          <h3 className="bl-t-h"><BarChart3 size={16} /> Course analytics — average graded score</h3>
          {o.classStats.every((c) => c.average === null) ? <Empty text="No graded work yet. Averages appear after you grade submissions." /> : (
            <div className="bl-t-bars">{o.classStats.map((c) => (
              <div key={c.id} className="bl-t-bar"><span>{c.name}</span><div><i style={{ width: `${c.average ?? 0}%` }} /></div><b>{c.average === null ? '—' : `${c.average}%`}</b></div>
            ))}</div>
          )}
        </article>
      </div>
    </section>
  );
}
