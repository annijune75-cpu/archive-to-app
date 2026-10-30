import { describe, it, expect } from 'vitest';
import { teacherOverview } from './teacher-overview';

const classes = [{ id: 'c1', name: 'Math 10', subject_id: 1, status: 'active' }];
const memberships = [
  { class_id: 'c1', student_id: 's1', status: 'active' },
  { class_id: 'c1', student_id: 's2', status: 'active' },
  { class_id: 'c1', student_id: 's3', status: 'removed' },
];
const assignments = [{ id: 'a1', class_id: 'c1', title: 'HW', due_at: '2099-01-01T00:00:00Z', max_score: 20 }];

describe('teacherOverview', () => {
  it('counts graded, awaiting and missing work from real records only', () => {
    const o = teacherOverview({ classes, memberships, assignments, submissions: [{ assignment_id: 'a1', student_id: 's1', score: 15, created_at: '2026-01-01' }] });
    expect(o.progress).toEqual({ graded: 1, awaiting: 0, missing: 1 });
    expect(o.students).toBe(2);
    expect(o.classStats[0]?.average).toBe(75);
  });
  it('reports no average when nothing is graded', () => {
    const o = teacherOverview({ classes, memberships, assignments, submissions: [] });
    expect(o.classStats[0]?.average).toBeNull();
  });
});
