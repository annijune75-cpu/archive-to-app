import { z } from 'zod';
export const classQuestionSchema = z.object({ q: z.string().trim().min(1).max(500), options: z.array(z.string().trim().min(1).max(200)).min(2).max(6), answer: z.number().int().min(0) }).refine(q => q.answer < q.options.length, 'Choose a valid answer.');
export const learnerQuestionSchema = z.object({ q: z.string(), options: z.array(z.string()) });
export const studentClassActionSchema = z.discriminatedUnion('kind', [
 z.object({ kind: z.literal('complete'), id: z.string().uuid() }),
 z.object({ kind: z.literal('quiz'), id: z.string().uuid(), answers: z.array(z.number().int().min(0).max(5)).min(1).max(50) }),
 z.object({ kind: z.literal('message'), class_id: z.string().uuid(), body: z.string().trim().min(1).max(2000) }),
 z.object({ kind: z.literal('read'), id: z.string().uuid() }),
 z.object({ kind: z.literal('resource'), id: z.string().uuid() }),
]);
export function classProgress(lessonIds: string[], completedIds: string[]) { return lessonIds.length ? Math.round(lessonIds.filter(id => completedIds.includes(id)).length / lessonIds.length * 100) : 0; }
export function unreadClassMessages(messages: Array<{id:string;sender_id:string}>, readIds: string[], userId: string) { return messages.filter(m => m.sender_id !== userId && !readIds.includes(m.id)); }