// @vitest-environment node
import { createClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';
const env=process.env;
const enabled=Boolean(env['E2E_STUDENT_EMAIL']&&env['E2E_STUDENT_PASSWORD']&&env['E2E_CLASS_QUIZ_ID']);
const client=createClient(env['VITE_SUPABASE_URL']??'https://unconfigured.invalid',env['VITE_SUPABASE_PUBLISHABLE_KEY']??'unconfigured',{auth:{persistSession:false,autoRefreshToken:false}});
describe.skipIf(!enabled)('student class privacy and trusted results',()=>{
 beforeAll(async()=>{const {error}=await client.auth.signInWithPassword({email:env['E2E_STUDENT_EMAIL']??'',password:env['E2E_STUDENT_PASSWORD']??''});if(error)throw error;});
 it('does not expose answer keys to learners',async()=>{const {data,error}=await client.from('class_quiz_keys').select('*');expect(error).toBeNull();expect(data).toEqual([]);});
 it('returns quiz prompts without correct-option fields',async()=>{const {data,error}=await client.from('class_content').select('questions').eq('id',env['E2E_CLASS_QUIZ_ID']??'').single();expect(error).toBeNull();expect(Array.isArray(data?.questions)).toBe(true);for(const q of data?.questions??[])expect(q).not.toHaveProperty('answer');});
 it('cannot create a fabricated score',async()=>{if(env['E2E_ALLOW_WRITES']!=='1')return;const {data:user}=await client.auth.getUser();const {error}=await client.from('class_quiz_attempts').insert({content_id:env['E2E_CLASS_QUIZ_ID'],student_id:user.user?.id,answers:[0],score:999,total_questions:1});expect(error).not.toBeNull();});
});