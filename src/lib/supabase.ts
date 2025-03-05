
import { createClient } from '@supabase/supabase-js';

// Use environment variables or the provided Supabase project details
const supabaseUrl = "https://rsdexzusykhhqlffikuh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A";

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if the application is using the default demo credentials.
 * In a real app, you would replace this with environment variable checks.
 * 
 * @returns {boolean} True if using default credentials, false if using custom credentials
 */
export const isUsingDefaultCredentials = (): boolean => {
  // Check if we have the default Supabase URL and key
  // This is a simplified check. In a real app, you might want to do more validation
  // or have a specific environment variable that controls this
  return (
    supabaseUrl === "https://rsdexzusykhhqlffikuh.supabase.co" &&
    supabaseAnonKey === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A"
  );
};

// Log for debugging purposes
console.log("Supabase initialized with URL:", supabaseUrl);
console.log("Using demo mode:", isUsingDefaultCredentials());
