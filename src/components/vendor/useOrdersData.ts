
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
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, string>>({});

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
          query = query.eq('shop_id', shopId);
        }
        
        const { data, error } = await query;
          
        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }
        
        // Parse JSONB items field and ensure status is properly typed
        const parsedOrders = data.map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          status: order.status as Order['status']
        }));
        
        setOrders(parsedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Subscribe to real-time updates with a unique channel name based on vendorId
    const channelName = `vendor-orders-${vendorId}-${Math.random().toString(36).substring(2, 9)}`;
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
          // Add new order to the list if it's not delivered or cancelled
          const newOrder = payload.new as Order;
          if (newOrder.status !== 'delivered' && newOrder.status !== 'cancelled') {
            // Ensure status is properly typed
            setOrders(prev => [{
              ...newOrder,
              status: newOrder.status as Order['status'],
              items: Array.isArray(newOrder.items) ? newOrder.items : []
            }, ...prev]);
            
            // Show toast notification for new order
            toast.success("New order received!");
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          // If order is delivered or cancelled, remove it from active list
          if (updated.status === 'delivered' || updated.status === 'cancelled') {
            setOrders(prev => prev.filter(order => order.id !== updated.id));
            // Remove from updating orders tracking
            setUpdatingOrders(prev => {
              const newState = {...prev};
              delete newState[updated.id];
              return newState;
            });
            
            if (updated.status === 'delivered') {
              toast.success(`Order #${updated.id.slice(0, 8)} has been delivered!`);
              if (onOrderDelivered) onOrderDelivered();
            }
          } else {
            // Otherwise update it in the list, but only if we aren't already tracking a local update
            setOrders(prev => prev.map(order => {
              if (order.id === updated.id) {
                // Only update if we aren't tracking a local update for this order,
                // or if the incoming status matches what we think it should be
                if (!updatingOrders[order.id] || updatingOrders[order.id] === updated.status) {
                  // We got confirmation, remove from updating tracking
                  if (updatingOrders[order.id]) {
                    setUpdatingOrders(prev => {
                      const newState = {...prev};
                      delete newState[updated.id];
                      return newState;
                    });
                  }
                  
                  return {
                    ...updated,
                    status: updated.status as Order['status'],
                    items: Array.isArray(updated.items) ? updated.items : order.items
                  };
                }
                // Otherwise keep our existing version for now
                return order;
              }
              return order;
            }));
            
            // Only show status update toast if we didn't initiate the update
            if (!updatingOrders[updated.id]) {
              toast.info(`Order #${updated.id.slice(0, 8)} status updated to: ${updated.status}`);
            }
          }
        } else if (payload.eventType === 'DELETE') {
          // Safe type checking for payload.old
          if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
            const oldId = payload.old.id;
            if (oldId) {
              setOrders(prev => prev.filter(order => order.id !== oldId));
              
              // Remove from updating orders tracking
              setUpdatingOrders(prev => {
                const newState = {...prev};
                delete newState[oldId];
                return newState;
              });
            }
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
  }, [vendorId, shopId, onOrderDelivered, updatingOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Validate that newStatus is a valid status type
      if (!['pending', 'preparing', 'prepared', 'delivering', 'delivered', 'cancelled'].includes(newStatus)) {
        console.error(`Invalid status: ${newStatus}`);
        toast.error("Invalid status value");
        return false;
      }
      
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      
      // Track that we're updating this order with optimistic UI
      setUpdatingOrders(prev => ({...prev, [orderId]: newStatus}));
      
      // Update order in local state for immediate feedback
      setOrders(prev => prev.map(order => 
        order.id === orderId ? {...order, status: newStatus as Order['status']} : order
      ));
      
      // Small delay to prevent rapid-fire updates and race conditions
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Then update in the database
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
        
        // Revert local state change if update failed
        setOrders(prev => {
          const originalOrder = prev.find(o => o.id === orderId);
          if (!originalOrder) return prev;
          
          // Find original status from before our optimistic update
          const originalStatus = originalOrder.status;
          
          return prev.map(order => 
            order.id === orderId ? {...order, status: originalStatus} : order
          );
        });
        
        // Remove from updating tracking
        setUpdatingOrders(prev => {
          const newState = {...prev};
          delete newState[orderId];
          return newState;
        });
        
        return false;
      }
      
      // Only show success toast for our initiated updates
      toast.success(`Order status updated to: ${newStatus}`);
      
      // Notify parent component about updates
      if (onOrderUpdate) onOrderUpdate();
      
      // Special handling for delivered orders
      if (newStatus === 'delivered') {
        if (onOrderDelivered) onOrderDelivered();
        
        // Remove delivered order from active orders list
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
      
      // Keep tracking the update until we get real-time confirmation
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
      
      // Remove from updating tracking on error
      setUpdatingOrders(prev => {
        const newState = {...prev};
        delete newState[orderId];
        return newState;
      });
      
      return false;
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
      
      toast.success("Order deleted successfully");
      
      // Remove from local state immediately
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
