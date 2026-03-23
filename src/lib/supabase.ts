/**
 * Supabase client singleton.
 *
 * Import `supabase` from this module in service files only.
 * Components must NEVER import the client directly — always go through
 * the service layer (src/services/*.ts).
 *
 * Required environment variables (set in .env.local, see .env.example):
 *   VITE_SUPABASE_URL      — Project URL from the Supabase dashboard
 *   VITE_SUPABASE_ANON_KEY — Anon/public key from the Supabase dashboard
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
