import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Order, RealtimePayload } from "./types";
import { toast } from "sonner";

interface UseOrdersDataProps {
  vendorId: string;
  shopId?: string;
  onOrderUpdate?: () => void;
  onOrderDelivered?: () => void;
}

export const useOrdersData = ({
  vendorId,
  shopId,
  onOrderUpdate,
  onOrderDelivered
}: UseOrdersDataProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch active orders
  const fetchActiveOrders = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      console.log("[useOrdersData] Fetching active orders for vendor:", vendorId, "shop:", shopId);
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .in('status', ['pending', 'preparing', 'ready', 'delivering'])
        .order('created_at', { ascending: false });
        
      if (shopId) {
        query = query.eq('restaurant_id', shopId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("[useOrdersData] Error fetching orders:", error);
        setLoading(false);
        return;
      }
      
      console.log("[useOrdersData] Fetched active orders:", data?.length || 0, data);
      
      // Parse JSONB items field
      const parsedOrders = data.map(order => {
        let parsedItems = [];
        try {
          parsedItems = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : Array.isArray(order.items) ? order.items : [];
        } catch (e) {
          console.error("[useOrdersData] Error parsing items for order:", order.id, e);
          parsedItems = [];
        }
        
        return {
          ...order,
          items: parsedItems
        };
      });
      
      setOrders(parsedOrders);
      setLoading(false);
    } catch (error) {
      console.error("[useOrdersData] Error fetching orders:", error);
      setLoading(false);
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`[useOrdersData] Updating order ${orderId} status to: ${newStatus}`);
      
      // Calculate estimated delivery time for preparing status
      let updateData: any = { status: newStatus };
      
      // If transitioning to preparing status, add delivery time estimate
      if (newStatus === 'preparing') {
        const estimatedTime = Math.floor(Math.random() * 20) + 15; // 15-35 minutes
        updateData.estimated_delivery_time = `${estimatedTime} minutes`;
      }
      
      // Update in the database
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) {
        console.error("[useOrdersData] Error updating order status:", error);
        toast.error("Failed to update order status");
        return;
      }
      
      toast.success(`Order status updated to: ${newStatus}`);
      
      // Special handling for delivered orders
      if (newStatus === 'delivered') {
        console.log("[useOrdersData] Order marked as delivered, will be removed from active list");
        // Remove from local state immediately without waiting for real-time
        setOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Notify parent about delivered orders
        if (onOrderDelivered) onOrderDelivered();
        
        // Notify parent to update stats
        if (onOrderUpdate) onOrderUpdate();
      } else {
        // For other status updates, update local state immediately without waiting for real-time
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? {...order, status: newStatus} 
              : order
          )
        );
      }
    } catch (error) {
      console.error("[useOrdersData] Error updating order status:", error);
      toast.error("An error occurred while updating order status");
    }
  };

  useEffect(() => {
    if (!vendorId) return;
    
    // Initially fetch active orders
    fetchActiveOrders();
    
    // Subscribe to real-time updates with a unique channel name
    const channelId = `vendor-orders-${vendorId}-${shopId || 'all'}-${Date.now()}`;
    console.log(`[useOrdersData] Setting up real-time channel: ${channelId}`);
    
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: shopId 
          ? `vendor_id=eq.${vendorId}&restaurant_id=eq.${shopId}`
          : `vendor_id=eq.${vendorId}`
      }, (payload: RealtimePayload) => {
        console.log("[useOrdersData] Real-time update received:", payload);
        
        // Ensure payload has the expected structure before proceeding
        if (!payload || typeof payload !== 'object') {
          console.error("[useOrdersData] Invalid payload received:", payload);
          return;
        }
        
        if (payload.eventType === 'INSERT') {
          handleInsertEvent(payload);
        } 
        else if (payload.eventType === 'UPDATE') {
          handleUpdateEvent(payload);
        } 
        else if (payload.eventType === 'DELETE') {
          handleDeleteEvent(payload);
        }
      })
      .subscribe((status) => {
        console.log("[useOrdersData] Subscription status:", status);
      });
    
    return () => {
      console.log("[useOrdersData] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [vendorId, shopId, onOrderUpdate, onOrderDelivered]);

  // Handler for INSERT events
  const handleInsertEvent = (payload: RealtimePayload) => {
    // Only add new orders with active statuses
    if (payload.new && typeof payload.new === 'object') {
      const newOrder = payload.new as unknown as Order;
      if (['pending', 'preparing', 'ready', 'delivering'].includes(newOrder.status)) {
        console.log("[useOrdersData] Adding new order:", newOrder.id);
        
        // Parse items if they're a string
        let parsedItems = [];
        try {
          if ('items' in newOrder) {
            parsedItems = typeof newOrder.items === 'string' 
              ? JSON.parse(newOrder.items) 
              : (Array.isArray(newOrder.items) ? newOrder.items : []);
          }
        } catch (e) {
          console.error("[useOrdersData] Error parsing items for new order:", newOrder.id, e);
          parsedItems = [];
        }
        
        setOrders(prev => [{...newOrder, items: parsedItems}, ...prev]);
        
        // Notify parent to update stats
        if (onOrderUpdate) onOrderUpdate();
      }
    }
  };

  // Handler for UPDATE events
  const handleUpdateEvent = (payload: RealtimePayload) => {
    // Check if the updated order data is valid
    if (payload.new && typeof payload.new === 'object') {
      const updated = payload.new as unknown as Order;
      console.log("[useOrdersData] Order updated:", updated.id, "New status:", updated.status);
      
      // If the order status changed to delivered or cancelled
      if (updated.status === 'delivered' || updated.status === 'cancelled') {
        console.log("[useOrdersData] Removing delivered/cancelled order:", updated.id);
        
        setOrders(prev => prev.filter(order => order.id !== updated.id));
        
        // Notify parent about delivered orders
        if (updated.status === 'delivered' && onOrderDelivered) {
          console.log("[useOrdersData] Triggering onOrderDelivered callback");
          onOrderDelivered();
        }
        
        // Notify parent to update stats
        if (onOrderUpdate) onOrderUpdate();
      } 
      else if (['pending', 'preparing', 'ready', 'delivering'].includes(updated.status)) {
        // Update the order in the list
        console.log("[useOrdersData] Updating order in list:", updated.id);
        
        // Parse items if they're a string
        let parsedItems = [];
        try {
          if ('items' in updated) {
            parsedItems = typeof updated.items === 'string' 
              ? JSON.parse(updated.items) 
              : (Array.isArray(updated.items) ? updated.items : []);
          } else {
            // Fallback to keeping the existing items
            const existingOrder = orders.find(o => o.id === updated.id);
            parsedItems = existingOrder ? existingOrder.items : [];
          }
        } catch (e) {
          console.error("[useOrdersData] Error parsing items for updated order:", updated.id, e);
          // Fallback to keeping the existing items
          const existingOrder = orders.find(o => o.id === updated.id);
          parsedItems = existingOrder ? existingOrder.items : [];
        }
        
        setOrders(prev => {
          // Check if order exists in the list
          const orderExists = prev.some(order => order.id === updated.id);
          
          if (orderExists) {
            // Update existing order
            return prev.map(order => 
              order.id === updated.id 
                ? {...updated, items: parsedItems} 
                : order
            );
          } else {
            // Add order if it doesn't exist (should be rare)
            return [{...updated, items: parsedItems}, ...prev];
          }
        });
        
        // Notify parent to update stats
        if (onOrderUpdate) onOrderUpdate();
      }
    }
  };

  // Handler for DELETE events
  const handleDeleteEvent = (payload: RealtimePayload) => {
    if (payload.old && typeof payload.old === 'object') {
      console.log("[useOrdersData] DELETE event payload.old:", payload.old);
      
      const oldRecord = payload.old as Record<string, unknown>;
      
      // First check if id property exists on the object
      if ('id' in oldRecord) {
        // Then check if the id value is valid
        if (oldRecord.id !== undefined && oldRecord.id !== null) {
          // Convert id to string regardless of its original type
          const deletedOrderId = String(oldRecord.id);
          
          console.log("[useOrdersData] Order deleted:", deletedOrderId);
          
          // Remove the deleted order from the state
          setOrders(prev => prev.filter(order => order.id !== deletedOrderId));
          
          // Notify parent to update stats
          if (onOrderUpdate) onOrderUpdate();
        } else {
          console.error("[useOrdersData] Invalid id value in DELETE payload:", oldRecord.id);
        }
      } else {
        console.error("[useOrdersData] Missing id property in DELETE payload:", oldRecord.old);
      }
    } else {
      console.error("[useOrdersData] Invalid DELETE payload structure:", payload.old);
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    fetchActiveOrders
  };
};
