
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ChefHat, Package, Truck, CheckCircle, ShoppingBag } from "lucide-react";
import { Order } from "@/components/vendor/types";
import OrderCard from "@/components/OrderCard";

interface VendorOrdersListProps {
  vendorId: string;
  shopId?: string;
  onOrderUpdate?: () => void;
  onOrderDelivered?: () => void;
}

const VendorOrdersList: React.FC<VendorOrdersListProps> = ({ 
  vendorId, 
  shopId,
  onOrderUpdate,
  onOrderDelivered
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Track which orders are currently being updated to prevent UI flicker
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});
  // Use a ref to keep track of the channel
  const channelRef = useRef<any>(null);

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
          // Ensure status is properly typed as one of the allowed values
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
    
    // Subscribe to real-time updates with a unique channel name
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
          const newOrder = payload.new as Order;
          if (newOrder.status !== 'delivered' && newOrder.status !== 'cancelled') {
            // Ensure status is properly typed
            const typedOrder = {
              ...newOrder,
              status: newOrder.status as Order['status']
            };
            setOrders(prev => [typedOrder, ...prev]);
            toast.success("New order received!");
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          
          // If order is being updated locally, wait for our update to complete
          if (updatingOrders[updated.id]) {
            console.log(`Order ${updated.id} is being updated locally, skipping real-time update`);
            return;
          }
          
          // If order is delivered or cancelled, remove it from active list
          if (updated.status === 'delivered' || updated.status === 'cancelled') {
            setOrders(prev => prev.filter(order => order.id !== updated.id));
            
            if (updated.status === 'delivered') {
              toast.success(`Order #${updated.id.slice(0, 8)} has been delivered!`);
              if (onOrderDelivered) onOrderDelivered();
            }
          } else {
            // Otherwise update it
            setOrders(prev => prev.map(order => 
              order.id === updated.id ? {
                ...updated, 
                status: updated.status as Order['status'],
                items: Array.isArray(updated.items) ? updated.items : 
                       Array.isArray(order.items) ? order.items : []
              } : order
            ));
            
            // Show status update toast if we aren't the ones updating it
            toast.info(`Order status updated to: ${updated.status}`);
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
    
    channelRef.current = channel;
    
    return () => {
      console.log("Cleaning up vendor orders subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [vendorId, shopId, onOrderDelivered]);

  // UPDATED: Implement the exact pattern Claude specified for updating order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      
      // Validate that newStatus is a valid status type
      if (!['pending', 'preparing', 'prepared', 'delivering', 'delivered', 'cancelled'].includes(newStatus)) {
        console.error(`Invalid status: ${newStatus}`);
        toast.error("Invalid status value");
        return false;
      }
      
      // Mark this order as being updated locally
      setUpdatingOrders(prev => ({...prev, [orderId]: true}));
      
      // First update the local state for immediate feedback
      setOrders(prev => prev.map(order => 
        order.id === orderId ? {...order, status: newStatus as Order['status']} : order
      ));
      
      // First update the order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        console.error("Failed to update order status:", updateError);
        toast.error("Failed to update order status");
        
        // Revert local state change if update failed
        fetchOrders();
        
        // Remove from updating orders
        setUpdatingOrders(prev => {
          const newState = {...prev};
          delete newState[orderId];
          return newState;
        });
        
        return false;
      }
      
      // Then record in history table - THIS IS CRITICAL
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          timestamp: new Date().toISOString()
        });
      
      if (historyError) {
        console.error("Failed to record status history:", historyError);
        toast.error("Failed to record status history");
        return false;
      }
      
      toast.success(`Order status updated to: ${newStatus}`);
      
      // Notify parent component about updates
      if (onOrderUpdate) onOrderUpdate();
      
      // Special handling for delivered orders
      if (newStatus === 'delivered') {
        if (onOrderDelivered) onOrderDelivered();
        
        // Remove delivered order from active orders list
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
      
      // Remove from updating orders after a small delay to ensure real-time update is processed correctly
      setTimeout(() => {
        setUpdatingOrders(prev => {
          const newState = {...prev};
          delete newState[orderId];
          return newState;
        });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
      
      // Remove from updating orders
      setUpdatingOrders(prev => {
        const newState = {...prev};
        delete newState[orderId];
        return newState;
      });
      
      return false;
    }
  };
  
  // Function to refetch orders
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
        query = query.eq('shop_id', shopId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Active Orders
          {orders.length > 0 && (
            <Badge className="ml-2 bg-blue-500">{orders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isVendor={true}
                onStatusChange={updateOrderStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No active orders at the moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOrdersList;
