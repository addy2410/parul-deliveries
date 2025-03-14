
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

/**
 * Get the progress percentage based on order status
 * @param status Current order status
 * @returns Progress percentage (0-100)
 */
export const getOrderProgressPercentage = (status: string): number => {
  switch (status) {
    case 'pending': return 0;
    case 'preparing': return 30;
    case 'prepared': return 60;
    case 'delivering': return 90;
    case 'delivered': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

/**
 * Get the next status in the order workflow
 * @param currentStatus Current order status
 * @returns The next status in the workflow
 */
export const getNextOrderStatus = (currentStatus: string): string => {
  switch (currentStatus) {
    case 'pending': return 'preparing';
    case 'preparing': return 'prepared';
    case 'prepared': return 'delivering';
    case 'delivering': return 'delivered';
    default: return currentStatus;
  }
};

/**
 * Update an order's status
 * @param orderId The order ID to update
 * @param newStatus The new status to set
 * @returns Object indicating success or error
 */
export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    console.log(`Updating order ${orderId} status to: ${newStatus}`);
    
    // Add a small delay to ensure UI transitions are smooth
    // This prevents race conditions between optimistic updates and realtime updates
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      console.error("Error updating order status:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error };
  }
};

/**
 * Clean up stale orders (older than 2 hours that are still in processing state)
 * @returns Object indicating success or error
 */
export const cleanupStaleOrders = async () => {
  try {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .lt('created_at', twoHoursAgo.toISOString())
      .in('status', ['pending', 'preparing', 'prepared']);
    
    if (error) {
      console.error("Error cleaning up stale orders:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error cleaning up stale orders:", error);
    return { success: false, error };
  }
};

/**
 * Fetch active orders for a vendor
 * @param vendorId The vendor ID
 * @param shopId Optional shop ID to filter by
 * @returns Object containing the orders or an error
 */
export const fetchVendorActiveOrders = async (vendorId: string, shopId?: string) => {
  try {
    // Only get orders from the last 24 hours that are not delivered or cancelled
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    let query = supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .not('status', 'in', '("delivered","cancelled")')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (shopId) {
      query = query.eq('restaurant_id', shopId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching vendor active orders:", error);
      return { success: false, error };
    }
    
    // Parse JSONB items field
    const parsedOrders = data.map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));
    
    return { success: true, data: parsedOrders };
  } catch (error) {
    console.error("Error fetching vendor active orders:", error);
    return { success: false, error };
  }
};

/**
 * Fetch student active orders
 * @param studentId The student ID
 * @returns Object containing the orders or an error
 */
export const fetchStudentActiveOrders = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops:shop_id(name)
      `)
      .eq('student_id', studentId)
      .not('status', 'in', '("delivered", "cancelled")')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching student active orders:", error);
      return { success: false, error };
    }
    
    // Parse orders and add restaurant name
    const parsedOrders = data.map((order) => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : [],
      restaurantName: order.shops?.name || "Unknown Restaurant"
    }));
    
    return { success: true, data: parsedOrders };
  } catch (error) {
    console.error("Error fetching student active orders:", error);
    return { success: false, error };
  }
};

/**
 * Fetch student order history
 * @param studentId The student ID
 * @param limit Optional limit on number of orders to return
 * @returns Object containing the orders or an error
 */
export const fetchStudentOrderHistory = async (studentId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops:shop_id(name)
      `)
      .eq('student_id', studentId)
      .in('status', ['delivered', 'cancelled'])
      .order('updated_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching student order history:", error);
      return { success: false, error };
    }
    
    // Parse orders and add restaurant name
    const parsedOrders = data.map((order) => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : [],
      restaurantName: order.shops?.name || "Unknown Restaurant"
    }));
    
    return { success: true, data: parsedOrders };
  } catch (error) {
    console.error("Error fetching student order history:", error);
    return { success: false, error };
  }
};
