type Cls = { id: string; name: string; subject_id: number | null; status: string };
type Mem = { class_id: string; student_id: string; status: string };
type Asg = { id: string; class_id: string; title: string; due_at: string | null; max_score: number; created_at?: string };
type Sub = { assignment_id: string; student_id: string; score: number | null; created_at: string; updated_at?: string };

const DAY = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Summarises a teacher's real class activity. Every number comes from saved records. */
export function teacherOverview(input: { classes: Cls[]; memberships: Mem[]; assignments: Asg[]; submissions: Sub[] }, now = new Date()) {
  const active = input.memberships.filter((m) => m.status === 'active');
  const studentsIn = (classId: string) => active.filter((m) => m.class_id === classId).length;
  const subsFor = (a: Asg) => input.submissions.filter((s) => s.assignment_id === a.id);
  const pctOf = (s: Sub) => { const a = input.assignments.find((x) => x.id === s.assignment_id); return a && s.score !== null ? (s.score / Math.max(1, a.max_score)) * 100 : null; };

  let graded = 0, awaiting = 0, missing = 0;
  for (const a of input.assignments) {
    const subs = subsFor(a);
    graded += subs.filter((s) => s.score !== null).length;
    awaiting += subs.filter((s) => s.score === null).length;
    missing += Math.max(0, studentsIn(a.class_id) - subs.length);
  }

  const upcoming = input.assignments
    .filter((a) => a.due_at && new Date(a.due_at) >= now)
    .sort((x, y) => new Date(x.due_at!).getTime() - new Date(y.due_at!).getTime())
    .map((a) => { const days = (new Date(a.due_at!).getTime() - now.getTime()) / DAY; return { ...a, urgency: days <= 3 ? 'soon' as const : days <= 7 ? 'week' as const : 'later' as const }; });

  const classStats = input.classes.map((c) => {
    const asg = input.assignments.filter((a) => a.class_id === c.id);
    const scored = asg.flatMap((a) => subsFor(a).map(pctOf).filter((v): v is number => v !== null));
    const expected = asg.length * studentsIn(c.id);
    const received = asg.reduce((t, a) => t + subsFor(a).length, 0);
    return { id: c.id, name: c.name, subject_id: c.subject_id, status: c.status, students: studentsIn(c.id), assignments: asg.length, average: scored.length ? Math.round(scored.reduce((t, v) => t + v, 0) / scored.length) : null, submissionRate: expected ? Math.min(100, Math.round((received / expected) * 100)) : null };
  });

  const byStudent = new Map<string, number[]>();
  for (const s of input.submissions) { const p = pctOf(s); if (p !== null) byStudent.set(s.student_id, [...(byStudent.get(s.student_id) ?? []), p]); }
  const topStudents = [...byStudent.entries()].map(([student_id, v]) => ({ student_id, average: Math.round(v.reduce((t, x) => t + x, 0) / v.length) })).sort((a, b) => b.average - a.average).slice(0, 5);

  const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(now.getTime() - (6 - i) * DAY)));
  const count = (dates: (string | undefined)[]) => days.map((d) => dates.filter((x) => x && x.slice(0, 10) === d).length);
  const series = {
    days,
    assignments: count(input.assignments.map((a) => a.created_at)),
    submissions: count(input.submissions.map((s) => s.created_at)),
    graded: count(input.submissions.filter((s) => s.score !== null).map((s) => s.updated_at ?? s.created_at)),
  };

  const recent = [...input.submissions].sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, 5);

  return { students: new Set(active.map((m) => m.student_id)).size, progress: { graded, awaiting, missing }, upcoming, classStats, recent, topStudents, series };
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
