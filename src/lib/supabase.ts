import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_DATABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Supabase environment variables are required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    : null;

// Keep app renderable when env vars are missing so users see a clear message instead of a blank screen.
const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseAnonKey = 'public-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey
);
