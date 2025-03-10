
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ChefHat, Package, Truck, CheckCircle, ShoppingBag } from "lucide-react";

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  student_id: string;
  vendor_id: string;
  restaurant_id: string;  
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
}

// Define more specific types for the payload objects
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: {
    id?: string;
    [key: string]: any;
  }; 
  old?: {
    id?: string;
    [key: string]: any;
  };
}

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

  // Function to fetch active orders
  const fetchActiveOrders = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      console.log("[VendorOrdersList] Fetching active orders for vendor:", vendorId, "shop:", shopId);
      
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
        console.error("[VendorOrdersList] Error fetching orders:", error);
        setLoading(false); // Make sure to set loading to false on error
        return;
      }
      
      console.log("[VendorOrdersList] Fetched active orders:", data?.length || 0, data);
      
      // Parse JSONB items field
      const parsedOrders = data.map(order => {
        let parsedItems = [];
        try {
          parsedItems = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : Array.isArray(order.items) ? order.items : [];
        } catch (e) {
          console.error("[VendorOrdersList] Error parsing items for order:", order.id, e);
          parsedItems = [];
        }
        
        return {
          ...order,
          items: parsedItems
        };
      });
      
      setOrders(parsedOrders);
      setLoading(false); // Set loading to false after data is processed
    } catch (error) {
      console.error("[VendorOrdersList] Error fetching orders:", error);
      setLoading(false); // Make sure to set loading to false on error
    }
  };

  useEffect(() => {
    if (!vendorId) return;
    
    // Initially fetch active orders
    fetchActiveOrders();
    
    // Subscribe to real-time updates with a unique channel name
    const channelId = `vendor-orders-${vendorId}-${shopId || 'all'}-${Date.now()}`;
    console.log(`[VendorOrdersList] Setting up real-time channel: ${channelId}`);
    
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
        console.log("[VendorOrdersList] Real-time update received:", payload);
        
        // Ensure payload has the expected structure before proceeding
        if (!payload || typeof payload !== 'object') {
          console.error("[VendorOrdersList] Invalid payload received:", payload);
          return;
        }
        
        if (payload.eventType === 'INSERT') {
          // Only add new orders with active statuses
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const newOrder = payload.new as Order;
            if (['pending', 'preparing', 'ready', 'delivering'].includes(newOrder.status)) {
              console.log("[VendorOrdersList] Adding new order:", newOrder.id);
              
              // Parse items if they're a string
              let parsedItems = [];
              try {
                if ('items' in newOrder) {
                  parsedItems = typeof newOrder.items === 'string' 
                    ? JSON.parse(newOrder.items) 
                    : (Array.isArray(newOrder.items) ? newOrder.items : []);
                }
              } catch (e) {
                console.error("[VendorOrdersList] Error parsing items for new order:", newOrder.id, e);
                parsedItems = [];
              }
              
              setOrders(prev => [{...newOrder, items: parsedItems}, ...prev]);
              
              // Notify parent to update stats
              if (onOrderUpdate) onOrderUpdate();
            }
          }
        } 
        else if (payload.eventType === 'UPDATE') {
          // Check if the updated order data is valid
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const updated = payload.new as Order;
            console.log("[VendorOrdersList] Order updated:", updated.id, "New status:", updated.status);
            
            // If the order status changed to delivered or cancelled
            if (updated.status === 'delivered' || updated.status === 'cancelled') {
              console.log("[VendorOrdersList] Removing delivered/cancelled order:", updated.id);
              
              setOrders(prev => prev.filter(order => order.id !== updated.id));
              
              // Notify parent about delivered orders
              if (updated.status === 'delivered' && onOrderDelivered) {
                console.log("[VendorOrdersList] Triggering onOrderDelivered callback");
                onOrderDelivered();
              }
              
              // Notify parent to update stats
              if (onOrderUpdate) onOrderUpdate();
            } 
            else if (['pending', 'preparing', 'ready', 'delivering'].includes(updated.status)) {
              // Update the order in the list
              console.log("[VendorOrdersList] Updating order in list:", updated.id);
              
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
                console.error("[VendorOrdersList] Error parsing items for updated order:", updated.id, e);
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
        } 
        else if (payload.eventType === 'DELETE') {
          // Check if payload.old exists and has an id property
          if (payload.old && typeof payload.old === 'object') {
            // Use a local variable with explicit type annotation
            const payloadOld = payload.old as { id?: string };
            const deletedOrderId = payloadOld.id;
            
            // Only proceed if deletedOrderId is defined and is a string
            if (deletedOrderId && typeof deletedOrderId === 'string') {
              console.log("[VendorOrdersList] Order deleted:", deletedOrderId);
              
              setOrders(prev => prev.filter(order => order.id !== deletedOrderId));
              
              // Notify parent to update stats
              if (onOrderUpdate) onOrderUpdate();
            } else {
              console.error("[VendorOrdersList] Invalid deletedOrderId:", deletedOrderId);
            }
          }
        }
      })
      .subscribe((status) => {
        console.log("[VendorOrdersList] Subscription status:", status);
      });
    
    return () => {
      console.log("[VendorOrdersList] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [vendorId, shopId, onOrderUpdate, onOrderDelivered]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`[VendorOrdersList] Updating order ${orderId} status to: ${newStatus}`);
      
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
        console.error("[VendorOrdersList] Error updating order status:", error);
        toast.error("Failed to update order status");
        return;
      }
      
      toast.success(`Order status updated to: ${newStatus}`);
      
      // Special handling for delivered orders
      if (newStatus === 'delivered') {
        console.log("[VendorOrdersList] Order marked as delivered, will be removed from active list");
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
      console.error("[VendorOrdersList] Error updating order status:", error);
      toast.error("An error occurred while updating order status");
    }
  };
  
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivering';
      case 'delivering': return 'delivered';
      default: return currentStatus;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
      case 'preparing': return <ChefHat className="h-5 w-5 text-blue-500" />;
      case 'ready': return <Package className="h-5 w-5 text-purple-500" />;
      case 'delivering': return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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
              <Card key={order.id} className="border border-border/40">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">
                        Order #{order.id.slice(0, 8)}... 
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm">
                      <strong>Customer:</strong> {order.student_name}
                    </p>
                    <p className="text-sm">
                      <strong>Delivery:</strong> {order.delivery_location}
                    </p>
                    {order.estimated_delivery_time && (
                      <p className="text-sm">
                        <strong>Estimated time:</strong> {order.estimated_delivery_time}
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t border-border/40 pt-2 mb-3">
                    <p className="text-sm font-medium mb-1">Items:</p>
                    <ul className="text-sm space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/40 pt-2 mt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    {order.status !== 'cancelled' && (
                      <Button
                        className="bg-vendor-600 hover:bg-vendor-700"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      >
                        {getStatusIcon(getNextStatus(order.status))}
                        <span className="ml-2">
                          Mark as {getNextStatus(order.status).charAt(0).toUpperCase() + 
                                   getNextStatus(order.status).slice(1)}
                        </span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
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
