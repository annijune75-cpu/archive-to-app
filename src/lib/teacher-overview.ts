type Cls = { id: string; name: string; subject_id: number | null; status: string };
type Mem = { class_id: string; student_id: string; status: string };
type Asg = { id: string; class_id: string; title: string; due_at: string | null; max_score: number };
type Sub = { assignment_id: string; student_id: string; score: number | null; created_at: string };

/** Summarises a teacher's real class activity. Every number comes from saved records. */
export function teacherOverview(input: { classes: Cls[]; memberships: Mem[]; assignments: Asg[]; submissions: Sub[] }, now = new Date()) {
  const active = input.memberships.filter((m) => m.status === 'active');
  const studentsIn = (classId: string) => active.filter((m) => m.class_id === classId).length;
  const subsFor = (a: Asg) => input.submissions.filter((s) => s.assignment_id === a.id);

  let graded = 0, awaiting = 0, missing = 0;
  for (const a of input.assignments) {
    const subs = subsFor(a);
    graded += subs.filter((s) => s.score !== null).length;
    awaiting += subs.filter((s) => s.score === null).length;
    missing += Math.max(0, studentsIn(a.class_id) - subs.length);
  }

  const upcoming = input.assignments
    .filter((a) => a.due_at && new Date(a.due_at) >= now)
    .sort((x, y) => new Date(x.due_at!).getTime() - new Date(y.due_at!).getTime());

  const classStats = input.classes.map((c) => {
    const scored = input.assignments.filter((a) => a.class_id === c.id).flatMap((a) => subsFor(a).filter((s) => s.score !== null).map((s) => (s.score! / Math.max(1, a.max_score)) * 100));
    return { id: c.id, name: c.name, subject_id: c.subject_id, status: c.status, students: studentsIn(c.id), assignments: input.assignments.filter((a) => a.class_id === c.id).length, average: scored.length ? Math.round(scored.reduce((t, v) => t + v, 0) / scored.length) : null };
  });

  const recent = [...input.submissions].sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, 5);

  return { students: new Set(active.map((m) => m.student_id)).size, progress: { graded, awaiting, missing }, upcoming, classStats, recent };
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
