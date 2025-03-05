
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, MapPin, Phone, Clock } from "lucide-react";

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurant_id: string;
  student_id: string;
  student_name: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_location: string;
  estimated_delivery_time: string;
}

interface VendorOrdersSectionProps {
  shopId: string;
  vendorId: string;
}

const VendorOrdersSection: React.FC<VendorOrdersSectionProps> = ({ shopId, vendorId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchOrders();
    
    // Set up realtime subscription for new orders
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${shopId}`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchOrders();
          
          // Show toast notification for new orders
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            if (newOrder && newOrder.status === 'pending') {
              toast.success(`New order received from ${newOrder.student_name}`, {
                description: `Order ID: ${newOrder.id.slice(0, 8)}`,
                duration: 5000
              });
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);
  
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', shopId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingOrderId(orderId);
      
      const { data, error } = await supabase.functions.invoke('update-order-status', {
        body: {
          orderId,
          status: newStatus,
          vendorId
        }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || 'Failed to update order status');
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  const getNextStatusButton = (order: Order) => {
    if (order.status === 'pending') {
      return (
        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={() => handleUpdateStatus(order.id, 'accepted')}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={updatingOrderId === order.id}
          >
            {updatingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept Order'}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={updatingOrderId === order.id}
              >
                Decline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel the order and notify the customer. Are you sure you want to decline this order?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Decline Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
    
    const statusFlow = {
      accepted: { next: 'preparing', label: 'Start Preparing' },
      preparing: { next: 'ready', label: 'Mark as Ready' },
      ready: { next: 'delivering', label: 'Send for Delivery' },
      delivering: { next: 'delivered', label: 'Mark as Delivered' }
    };
    
    // If order is in a state that can be updated
    if (order.status in statusFlow && order.status !== 'delivered' && order.status !== 'cancelled') {
      const nextStatus = statusFlow[order.status as keyof typeof statusFlow].next;
      const buttonLabel = statusFlow[order.status as keyof typeof statusFlow].label;
      
      return (
        <Button 
          onClick={() => handleUpdateStatus(order.id, nextStatus as Order['status'])} 
          className="w-full mt-4 bg-vendor-600 hover:bg-vendor-700"
          disabled={updatingOrderId === order.id}
        >
          {updatingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {buttonLabel}
        </Button>
      );
    }
    
    return null;
  };
  
  const getStatusBadge = (status: Order['status']) => {
    const statusStyles = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      accepted: 'bg-blue-500 hover:bg-blue-600',
      preparing: 'bg-purple-500 hover:bg-purple-600',
      ready: 'bg-indigo-500 hover:bg-indigo-600',
      delivering: 'bg-orange-500 hover:bg-orange-600',
      delivered: 'bg-green-500 hover:bg-green-600',
      cancelled: 'bg-red-500 hover:bg-red-600'
    };
    
    return (
      <Badge className={`${statusStyles[status]} capitalize`}>
        {status}
      </Badge>
    );
  };
  
  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => 
    ['accepted', 'preparing', 'ready', 'delivering'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  ).slice(0, 5); // Show only recent 5 completed orders
  
  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              {new Date(order.created_at).toLocaleString()}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Customer: {order.student_name}</p>
            
            <div className="flex items-start text-sm mb-1">
              <MapPin size={16} className="mr-1 mt-1 flex-shrink-0" />
              <span>{order.delivery_location}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-1 flex-shrink-0" />
              <span>{order.estimated_delivery_time}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Items:</p>
            <ul className="space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.menuItemId} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {getNextStatusButton(order)}
      </CardFooter>
    </Card>
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Pending Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">Pending Orders ({pendingOrders.length})</h2>
        {pendingOrders.length > 0 ? (
          pendingOrders.map(renderOrderCard)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No pending orders at the moment
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Active Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">Active Orders ({activeOrders.length})</h2>
        {activeOrders.length > 0 ? (
          activeOrders.map(renderOrderCard)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No active orders at the moment
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Recent Completed Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Completed Orders</h2>
        {completedOrders.length > 0 ? (
          completedOrders.map(renderOrderCard)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No completed orders yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersSection;
