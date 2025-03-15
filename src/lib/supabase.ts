
import { createClient } from '@supabase/supabase-js';

// Use environment variables or the provided Supabase project details
const supabaseUrl = "https://rsdexzusykhhqlffikuh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGV4enVzeWtoaHFsZmZpa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODgzODAsImV4cCI6MjA1NjU2NDM4MH0.aJEbQ8XKRvGi2zQ0PX9i_171R22dvddBiRMWoWAfN-A";

// Initialize the Supabase client with autoRefreshToken, persistSession, and schema caching disabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Function to check if we're using default credentials (demo mode)
// In our case, we're deliberately using this configuration, so we'll suppress
// the demo mode notification by always returning false
export const isUsingDefaultCredentials = () => {
  // Always return false to suppress demo mode notifications
  return false;
};

/**
 * Helper function to safely delete a user by first deleting associated vendor records
 * This solves the foreign key constraint issue when deleting users
 * @param userId The ID of the user to delete
 * @returns Result of the deletion operation
 */
export const safelyDeleteUser = async (userId: string) => {
  try {
    // First check if user has a vendor record
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', userId);
    
    if (vendorError) {
      console.error("Error checking vendor records:", vendorError);
      return { success: false, error: vendorError };
    }
    
    // If user has a vendor record, delete it first
    if (vendorData && vendorData.length > 0) {
      // Check for any shops owned by this vendor
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('vendor_id', userId);
        
      if (shopsError) {
        console.error("Error checking shops:", shopsError);
        return { success: false, error: shopsError };
      }
      
      // If there are shops, delete them first
      if (shopsData && shopsData.length > 0) {
        // For each shop, delete its menu items first
        for (const shop of shopsData) {
          const { error: menuItemsError } = await supabase
            .from('menu_items')
            .delete()
            .eq('shop_id', shop.id);
            
          if (menuItemsError) {
            console.error(`Error deleting menu items for shop ${shop.id}:`, menuItemsError);
            return { success: false, error: menuItemsError };
          }
        }
        
        // Now delete the shops
        const { error: deleteShopsError } = await supabase
          .from('shops')
          .delete()
          .eq('vendor_id', userId);
          
        if (deleteShopsError) {
          console.error("Error deleting shops:", deleteShopsError);
          return { success: false, error: deleteShopsError };
        }
      }
      
      // Now delete the vendor record
      const { error: deleteVendorError } = await supabase
        .from('vendors')
        .delete()
        .eq('id', userId);
        
      if (deleteVendorError) {
        console.error("Error deleting vendor:", deleteVendorError);
        return { success: false, error: deleteVendorError };
      }
    }
    
    // Check for student_profiles record
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', userId);
      
    if (studentError) {
      console.error("Error checking student profile:", studentError);
      return { success: false, error: studentError };
    }
    
    // If user has a student profile, delete it
    if (studentData && studentData.length > 0) {
      const { error: deleteStudentError } = await supabase
        .from('student_profiles')
        .delete()
        .eq('id', userId);
        
      if (deleteStudentError) {
        console.error("Error deleting student profile:", deleteStudentError);
        return { success: false, error: deleteStudentError };
      }
    }
    
    // Now we can finally delete the user with the admin API
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      userId
    );
    
    if (deleteUserError) {
      console.error("Error deleting user:", deleteUserError);
      return { success: false, error: deleteUserError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting user:", error);
    return { success: false, error };
  }
};

// Log for debugging purposes
console.log("Supabase initialized with URL:", supabaseUrl);

// Helper function to generate unique channel IDs for realtime subscriptions
export const generateUniqueChannelId = (base: string): string => {
  return `${base}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Helper function to record order status history - implementing Claude's exact pattern
export const recordOrderStatusHistory = async (orderId: string, status: string) => {
  try {
    // First update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);
    
    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return false;
    }
    
    // Then record in history table - THIS IS CRITICAL
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        timestamp: new Date().toISOString()
      });
    
    if (historyError) {
      console.error("Failed to record order status history:", historyError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error recording order status history:", error);
    return false;
  }
};
