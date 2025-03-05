
import { createClient } from '@supabase/supabase-js';

// Use environment variables or the provided Supabase project details
const supabaseUrl = "https://rsdexzusykhhqlffikuh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A";

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if we're using default credentials (always false now that we've set real credentials)
export const isUsingDefaultCredentials = () => {
  return false; // We're now using real credentials
};

// For debugging purposes
console.log("Supabase Mode: Production Mode");
console.log("Using URL:", supabaseUrl);

// Initialize default vendors for demo mode
export const initializeDefaultVendors = async () => {
  if (!isUsingDefaultCredentials()) {
    // Skip initialization in production mode since we now have real Supabase instance
    console.log("Using production Supabase instance - no need to initialize demo vendors");
  }
};

// Skip initialization of default data in production mode
