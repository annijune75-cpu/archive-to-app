// BridgeLIB now runs on Lovable Cloud: reuse the generated browser client and its project values.
export { supabase } from '@/integrations/supabase/client';

const env = (name: string): string | undefined =>
  typeof process !== 'undefined' ? process.env?.[name] : undefined;

export const BRIDGE_SUPABASE_URL: string =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ?? env('SUPABASE_URL') ?? '';
export const BRIDGE_PUBLISHABLE_KEY: string =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ?? env('SUPABASE_PUBLISHABLE_KEY') ?? '';

/** fetch that sends the publishable key as `apikey` and never as a bearer token (it is not a JWT). */
export const publishableFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (headers.get('Authorization') === `Bearer ${BRIDGE_PUBLISHABLE_KEY}`) headers.delete('Authorization');
  headers.set('apikey', BRIDGE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
};
