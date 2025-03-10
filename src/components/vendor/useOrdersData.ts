import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Order } from "./types";

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
  onOrderDelivered,
}: UseOrdersDataProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendorId)
          .not('status', 'in', '("delivered","cancelled")') // Only active orders
          .order('created_at', { ascending: false });
          
        if (shopId) {
          query = query.eq('restaurant_id', shopId);
        }
        
        const { data, error } = await query;
          
        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }
        
        // Parse JSONB items field
        const parsedOrders = data.map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : []
        }));
        
        setOrders(parsedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Subscribe to real-time updates with a unique channel name
    const channelName = `vendor-orders-changes-${vendorId}-${Math.random().toString(36).substring(2, 15)}`;
    console.log(`Setting up vendor orders channel: ${channelName}`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `vendor_id=eq.${vendorId}`
      }, (payload) => {
        console.log("Vendor received real-time order update:", payload);
        
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as Order, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          // If order is delivered or cancelled, remove it from active list
          if (updated.status === 'delivered' || updated.status === 'cancelled') {
            setOrders(prev => prev.filter(order => order.id !== updated.id));
          } else {
            // Otherwise update it
            setOrders(prev => prev.map(order => 
              order.id === updated.id ? {...updated, items: order.items} : order
            ));
          }
        } else if (payload.eventType === 'DELETE') {
          // Safe type checking for payload.old
          if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
            const oldId = payload.old.id;
            if (oldId) {
              setOrders(prev => prev.filter(order => order.id !== oldId));
            }
          } else {
            console.error("Invalid payload.old structure:", payload.old);
          }
        }
      })
      .subscribe((status) => {
        console.log("Vendor orders subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to vendor orders real-time updates");
        } else {
          console.error("Failed to subscribe to vendor orders real-time updates. Status:", status);
        }
      });
    
    return () => {
      console.log("Cleaning up vendor orders subscription");
      supabase.removeChannel(channel);
    };
  }, [vendorId, shopId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      
      // First update the local state for immediate feedback
      setOrders(prev => prev.map(order => 
        order.id === orderId ? {...order, status: newStatus} : order
      ));
      
      // Then update in the database
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
        
        // Revert local state change if update failed
        fetchOrders();
        return;
      }
      
      toast.success(`Order status updated to: ${newStatus}`);
      
      // Notify parent component about updates
      if (onOrderUpdate) onOrderUpdate();
      
      // Special handling for delivered orders
      if (newStatus === 'delivered') {
        if (onOrderDelivered) onOrderDelivered();
        
        // Remove from active orders list
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
    }
  };
  
  // Added function to refetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .not('status', 'in', '("delivered","cancelled")')
        .order('created_at', { ascending: false });
        
      if (shopId) {
        query = query.eq('restaurant_id', shopId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }
      
      const parsedOrders = data.map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : []
      }));
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteOrder = async (orderId: string) => {
    try {
      setIsDeletingOrder(true);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
        return;
      }
      
      toast.success("Test order deleted successfully");
      
      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      if (onOrderUpdate) onOrderUpdate();
      
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("An error occurred while deleting order");
    } finally {
      setIsDeletingOrder(false);
      setSelectedOrder(null);
    }
  };

  return {
    orders,
    loading,
    selectedOrder,
    setSelectedOrder,
    isDeletingOrder,
    updateOrderStatus,
    deleteOrder
  };
};
