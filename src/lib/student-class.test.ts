import { describe, expect, it } from 'vitest';
import { classProgress, classQuestionSchema, unreadClassMessages } from './student-class';
describe('real student class records', () => {
 it('counts only completed lessons in this class', () => { expect(classProgress(['one','two'], ['one','other'])).toBe(50); expect(classProgress([], ['other'])).toBe(0); });
 it('counts received unread messages, not the student’s own messages', () => { expect(unreadClassMessages([{id:'a',sender_id:'teacher'},{id:'b',sender_id:'student'},{id:'c',sender_id:'teacher'}], ['c'], 'student').map(m=>m.id)).toEqual(['a']); });
 it('rejects an answer index outside the actual options', () => { expect(classQuestionSchema.safeParse({q:'2 + 2?',options:['3','4'],answer:2}).success).toBe(false); expect(classQuestionSchema.safeParse({q:'2 + 2?',options:['3','4'],answer:1}).success).toBe(true); });
});