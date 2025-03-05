
import { createClient } from '@supabase/supabase-js';

// Use environment variables or the provided Supabase project details
const supabaseUrl = "https://rsdexzusykhhqlffikuh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A";

// Initialize the Supabase client with autoRefreshToken and persistSession set to true
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

/**
 * Checks if the application is using the default demo credentials.
 * This is now always set to false since we have a real Supabase instance.
 * 
 * @returns {boolean} False as we're using the real Supabase credentials
 */
export const isUsingDefaultCredentials = (): boolean => {
  return false;
};

// Log for debugging purposes
console.log("Supabase initialized with URL:", supabaseUrl);
console.log("Using demo mode:", isUsingDefaultCredentials());
