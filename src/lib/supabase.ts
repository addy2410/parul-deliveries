
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Default values for development - we will no longer use these
const defaultSupabaseUrl = 'https://rsdexzusykhhqlffikuh.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A';

// Use real Supabase values directly
const supabaseUrl = defaultSupabaseUrl;
const supabaseAnonKey = defaultSupabaseAnonKey;

// Initialize the Supabase client with the real values
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Always use production mode
export const isUsingDefaultCredentials = () => false;

// Log connection info
console.log("Supabase Mode: Production Mode");
console.log("Using URL:", supabaseUrl.substring(0, 15) + "...");

// Update domain for emails to match what we're using for authentication
const validEmailDomain = "vendor.campusgrub.app";

// Initialize demo vendors if they don't exist yet
export const initializeDefaultVendors = async () => {
  try {
    // Check if we have our demo vendors
    const vendorIds = ['CAPITOL-VENDOR', 'GREENZY-VENDOR', 'MAIN-VENDOR']; 
    const emails = vendorIds.map(id => `${id.toLowerCase()}@${validEmailDomain}`);
    
    // Check each vendor
    for (let i = 0; i < vendorIds.length; i++) {
      const vendorId = vendorIds[i];
      const email = emails[i];
      
      // Try to sign in first to check if vendor exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'campus123'
      });
      
      // If vendor doesn't exist, create it
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: 'campus123',
          options: {
            data: {
              pucampid: vendorId,
              vendor_type: 'campus'
            }
          }
        });
        
        if (signUpError) {
          console.error(`Failed to create vendor ${vendorId}:`, signUpError);
        } else if (signUpData.user) {
          console.log(`Created vendor ${vendorId}`);
          
          // Insert vendor data
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert([{ 
              id: signUpData.user.id,
              pucampid: vendorId,
              email
            }]);
            
          if (vendorError) {
            console.error(`Failed to create vendor record for ${vendorId}:`, vendorError);
          }
        }
      }
    }
    
    // Create user VEN12345 if it doesn't exist
    const testVendorId = 'VEN12345';
    const testEmail = `${testVendorId.toLowerCase()}@${validEmailDomain}`;
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'sss123'
    });
    
    if (signInError && signInError.message.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'sss123',
        options: {
          data: {
            pucampid: testVendorId,
            vendor_type: 'campus'
          }
        }
      });
      
      if (signUpError) {
        console.error("Failed to create VEN12345 vendor:", signUpError);
      } else if (signUpData.user) {
        console.log("Created VEN12345 vendor");
        
        // Insert vendor data
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert([{ 
            id: signUpData.user.id,
            pucampid: testVendorId,
            email: testEmail
          }]);
          
        if (vendorError) {
          console.error(`Failed to create vendor record for ${testVendorId}:`, vendorError);
        }
      }
    }
    
  } catch (error) {
    console.error("Error initializing default vendors:", error);
  }
};

// Try to init vendors on module load
initializeDefaultVendors().catch(e => console.error("Failed to initialize vendors:", e));
