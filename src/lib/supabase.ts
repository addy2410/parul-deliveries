
import { createClient } from '@supabase/supabase-js';

// Default values for development - replace these with your actual Supabase credentials
const defaultSupabaseUrl = 'https://your-supabase-project.supabase.co';
const defaultSupabaseAnonKey = 'your-supabase-anon-key';

// Use environment variables if available, otherwise use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a function to check if we're using default credentials
export const isUsingDefaultCredentials = () => {
  return supabaseUrl === defaultSupabaseUrl || supabaseAnonKey === defaultSupabaseAnonKey;
};
