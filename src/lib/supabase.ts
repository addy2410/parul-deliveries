
import { createClient } from '@supabase/supabase-js';

// Default values for development - replace these with your actual Supabase credentials
const defaultSupabaseUrl = 'https://your-supabase-project.supabase.co';
const defaultSupabaseAnonKey = 'your-supabase-anon-key';

// Use environment variables if available, otherwise use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a function to check if we're using default credentials
export const isUsingDefaultCredentials = () => {
  return supabaseUrl === defaultSupabaseUrl || supabaseAnonKey === defaultSupabaseAnonKey;
};

// For debugging purposes
console.log("Supabase Mode:", isUsingDefaultCredentials() ? "Demo Mode" : "Production Mode");
console.log("Using URL:", supabaseUrl.substring(0, 15) + "...");

// Initialize default vendors for demo mode
export const initializeDefaultVendors = async () => {
  if (!isUsingDefaultCredentials()) {
    try {
      // Create default vendors in Supabase for demonstration
      const defaultVendors = [
        { pucampid: 'MAIN-VENDOR', email: 'main-vendor@vendor.campusgrub.app', password: 'password123' },
        { pucampid: 'CAPITOL-VENDOR', email: 'capitol-vendor@vendor.campusgrub.app', password: 'password123' },
        { pucampid: 'GREENZY-VENDOR', email: 'greenzy-vendor@vendor.campusgrub.app', password: 'password123' }
      ];
      
      for (const vendor of defaultVendors) {
        try {
          // First try to sign up the vendor
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: vendor.email,
            password: vendor.password,
          });
          
          if (signUpError) {
            // If sign up fails, it might be because the user already exists
            // Just continue to the next vendor
            console.error(`Failed to create vendor ${vendor.pucampid}:`, signUpError);
            continue;
          }
          
          if (authData.user) {
            // Insert the vendor record in the vendors table
            const { error: vendorError } = await supabase
              .from('vendors')
              .upsert([
                { 
                  id: authData.user.id, 
                  pucampid: vendor.pucampid,
                  email: vendor.email
                }
              ]);
              
            if (vendorError) {
              console.error(`Failed to insert vendor ${vendor.pucampid} record:`, vendorError);
            }
          }
        } catch (error) {
          console.error(`Error creating vendor ${vendor.pucampid}:`, error);
        }
      }
    } catch (error) {
      console.error("Error initializing default vendors:", error);
    }
  }
};

// Initialize default data when in production mode
if (!isUsingDefaultCredentials()) {
  initializeDefaultVendors();
}
