
import { useState, useEffect, useCallback } from "react";
import { 
  supabase, 
  generateUniqueChannelId, 
  updateOrderStatus as updateOrderStatusUtil,
  fetchVendorActiveOrders
} from "@/lib/supabase";
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
  const [processingOrderIds, setProcessingOrderIds] = useState<string[]>([]);
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  
  const fetchOrders = useCallback(async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      const result = await fetchVendorActiveOrders(vendorId, shopId);
      
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        console.error("Error fetching orders:", result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [vendorId, shopId]);

  useEffect(() => {
    if (!vendorId) return;
    
    fetchOrders();
    
    // Setup auto-refresh every 30 seconds as a fallback
    const timer = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    setAutoRefreshTimer(timer);
    
    // Subscribe to real-time updates with a unique channel name based on vendorId
    const channelName = generateUniqueChannelId(`vendor-orders-${vendorId}`);
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
            setOrders(prev => {
              // Check if order already exists to avoid duplicates
              if (prev.some(order => order.id === newOrder.id)) {
                return prev;
              }
              return [newOrder, ...prev];
            });
            // Show toast notification for new order
            toast.success("New order received!");
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          const oldStatus = (payload.old as Order)?.status;
          
          // Only update if it's an actual change
          if (updated.status === oldStatus) {
            return;
          }
          
          // Remove the order from processing state if it's being processed
          setProcessingOrderIds(prev => prev.filter(id => id !== updated.id));
          
          // If order is delivered or cancelled, remove it from active list
          if (updated.status === 'delivered' || updated.status === 'cancelled') {
            setOrders(prev => prev.filter(order => order.id !== updated.id));
            if (updated.status === 'delivered') {
              toast.success(`Order #${updated.id.slice(0, 8)} has been delivered!`);
              if (onOrderDelivered) onOrderDelivered();
            } else if (updated.status === 'cancelled') {
              toast.error(`Order #${updated.id.slice(0, 8)} has been cancelled.`);
            }
          } else {
            // Otherwise update it in the list
            setOrders(prev => prev.map(order => 
              order.id === updated.id ? {
                ...updated,
                items: Array.isArray(updated.items) ? updated.items : order.items
              } : order
            ));
            toast.info(`Order #${updated.id.slice(0, 8)} status updated to: ${updated.status}`);
          }
        } else if (payload.eventType === 'DELETE') {
          // Safe type checking for payload.old
          if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
            const oldId = payload.old.id;
            if (oldId) {
              setOrders(prev => prev.filter(order => order.id !== oldId));
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
      
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
      }
    };
  }, [vendorId, shopId, onOrderDelivered, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Prevent multiple status updates at the same time for the same order
      if (processingOrderIds.includes(orderId)) {
        return false;
      }
      
      // Add the order to the processing list
      setProcessingOrderIds(prev => [...prev, orderId]);
      
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      
      // Optimistically update UI
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Actually update in database
      const result = await updateOrderStatusUtil(orderId, newStatus);
      
      if (!result.success) {
        console.error("Error updating order status:", result.error);
        toast.error("Failed to update order status");
        
        // Revert optimistic update
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: order.status } : order
        ));
        
        // Remove the order from processing state
        setProcessingOrderIds(prev => prev.filter(id => id !== orderId));
        return false;
      }
      
      // Notify parent component about updates
      if (onOrderUpdate) onOrderUpdate();
      
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
      
      // Remove the order from processing state
      setProcessingOrderIds(prev => prev.filter(id => id !== orderId));
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
      
      // Update will be handled by the real-time subscription
      
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
    processingOrderIds,
    updateOrderStatus,
    deleteOrder,
    refreshOrders: fetchOrders
  };
};
