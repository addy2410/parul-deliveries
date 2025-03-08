
import { supabase } from './supabase';

/**
 * This function creates an admin user in the Supabase auth system
 * This should be run once to set up the admin account
 */
export const createAdminUser = async () => {
  try {
    // Check if the admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('vendors')
      .select('*')
      .eq('email', 'admin@campusgrub.com')
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing admin:", checkError);
      return { success: false, error: checkError };
    }
    
    // If admin already exists, don't create a new one
    if (existingUser) {
      console.log("Admin user already exists");
      return { success: true, message: "Admin user already exists" };
    }
    
    // Create the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@campusgrub.com',
      password: 'Admin@CampusGrub123',
      options: {
        data: {
          user_type: 'admin',
          is_admin: true
        }
      }
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error };
    }
    
    console.log("Admin user created successfully:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("Unexpected error creating admin user:", error);
    return { success: false, error };
  }
};

// Export admin credentials for reference
export const adminCredentials = {
  email: 'admin@campusgrub.com',
  password: 'Admin@CampusGrub123'
};
