import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";

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
  shop_id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
  restaurantName?: string;
}

const ViewOrder = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          toast.error("Please login to view your order");
          return;
        }
        
        // Get the order with the restaurant name
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            shops:shop_id(name)
          `)
          .eq('id', id)
          .eq('student_id', session.session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching order:", error);
          toast.error("Failed to load order");
          return;
        }
        
        // Format order data
        const formattedOrder: Order = {
          ...data,
          items: Array.isArray(data.items) ? data.items : [],
          restaurantName: data.shops?.name || 'Unknown Restaurant'
        };
        
        setOrder(formattedOrder);
        
        // Set initial progress based on status
        setDeliveryProgress(getStatusProgress(formattedOrder.status));
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    
    // Set up real-time subscription to order updates
    const channel = supabase
      .channel('order-details-' + id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`
      }, async (payload) => {
        console.log("Real-time order update received:", payload);
        const updatedOrder = payload.new as any;
        
        // Get restaurant name
        let restaurantName = 'Unknown Restaurant';
        try {
          const { data } = await supabase
            .from('shops')
            .select('name')
            .eq('id', updatedOrder.shop_id)
            .single();
            
          if (data) {
            restaurantName = data.name;
          }
        } catch (e) {
          console.error("Error fetching shop name:", e);
        }
        
        setOrder(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ...updatedOrder,
            restaurantName,
            items: prev.items // Keep the parsed items
          };
        });
        
        // Update progress based on new status
        setDeliveryProgress(getStatusProgress(updatedOrder.status));
        
        // Show toast for status updates
        if (payload.old.status !== updatedOrder.status) {
          toast.success(`Order status updated to: ${updatedOrder.status}`);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  
  const getStatusProgress = (status: string) => {
    switch(status) {
      case 'pending': return 10;
      case 'preparing': return 30;
      case 'ready': return 50;
      case 'delivering': return 75;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Restaurant is confirming your order';
      case 'preparing': return 'Chef is preparing your food';
      case 'ready': return 'Your order is ready for delivery';
      case 'delivering': return 'Your order is on the way';
      case 'delivered': return 'Your order has been delivered';
      case 'cancelled': return 'Your order has been cancelled';
      default: return 'Unknown status';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-4 text-center mt-20">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Order not found</h2>
          <Button asChild className="mt-4 bg-[#ea384c] hover:bg-[#d02e40]">
            <Link to="/student/restaurants">Back to Restaurants</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/student/orders/active" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </Button>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{order.id.slice(0, 8)}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="relative pt-4">
                  <Progress
                    value={deliveryProgress}
                    className="h-2 mb-4 rounded bg-gray-200"
                  />
                  
                  <div className="text-center">
                    <p className="font-medium">{getStatusText(order.status)}</p>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated delivery: {order.estimated_delivery_time || 'Awaiting confirmation'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Location</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Order Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{(order.total_amount - 30).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm my-2">
                    <span>Delivery Fee</span>
                    <span>₹30.00</span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
                
                {order.status === 'delivered' && (
                  <Button 
                    asChild
                    className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                  >
                    <Link to="/student/restaurants">Order Again</Link>
                  </Button>
                )}

                {order.status === 'cancelled' && (
                  <Button 
                    asChild
                    className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                  >
                    <Link to="/student/restaurants">Place New Order</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
