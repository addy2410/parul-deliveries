import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, generateUniqueChannelId } from "@/lib/supabase";
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
    const channelName = generateUniqueChannelId(`vendor-orders-changes-${vendorId}`);
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
            setOrders(prev => [newOrder, ...prev]);
            toast.success("New order received!");
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          // If order is delivered or cancelled, remove it from active list
          if (updated.status === 'delivered' || updated.status === 'cancelled') {
            setOrders(prev => prev.filter(order => order.id !== updated.id));
            // Notify parent about delivered order
            if (updated.status === 'delivered' && onOrderDelivered) {
              onOrderDelivered();
            }
          } else {
            // Otherwise update it
            setOrders(prev => prev.map(order => 
              order.id === updated.id ? {...updated, items: Array.isArray(order.items) ? order.items : []} : order
            ));
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
  }, [vendorId, shopId, onOrderDelivered]);

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
        
        // Remove delivered order from active orders list
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
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
  
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'prepared';
      case 'prepared': return 'delivering';
      case 'delivering': return 'delivered';
      default: return currentStatus;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
      case 'preparing': return <ChefHat className="h-5 w-5 text-blue-500" />;
      case 'prepared': return <Package className="h-5 w-5 text-purple-500" />;
      case 'delivering': return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'prepared': return 'bg-purple-500';
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
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
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
