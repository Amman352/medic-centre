import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = 'https://frzebmslxgrpdhjcjcgm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};