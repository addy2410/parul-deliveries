
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Check, ChefHat, Truck, AlertTriangle, Clock } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
  restaurant_id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
}

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  
  // This function accepts a status parameter so it can work without relying on the order state
  const getOrderProgress = (status: string): number => {
    switch(status) {
      case 'pending': return 0;
      case 'preparing': return 25;
      case 'prepared': return 50;
      case 'delivering': return 75;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };
  
  useEffect(() => {
    if (!id) {
      console.error("No order ID provided in URL");
      toast.error("Order ID is missing");
      navigate("/student/orders/active");
      return;
    }
    
    console.log("OrderTracking component mounted with order ID:", id);
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.error("User not authenticated");
          toast.error("Please login to view your order");
          navigate("/student/login");
          return;
        }
        
        console.log("Fetching order with ID:", id);
        
        // Get the order
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error("Error fetching order:", error);
          toast.error("Failed to load order");
          return;
        }
        
        console.log("Order data received:", data);
        
        if (!data) {
          console.error("No order found with ID:", id);
          toast.error("Order not found");
          return;
        }
        
        const orderData = {
          ...data,
          items: Array.isArray(data.items) ? data.items : []
        };
        
        setOrder(orderData);
        
        // Update progress value based on current status
        const newProgressValue = getOrderProgress(orderData.status);
        setProgressValue(newProgressValue);
        console.log("Initial order status:", orderData.status, "Progress value:", newProgressValue);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    
    // Set up real-time subscription with a unique channel name
    const channelName = `order-tracking-${id}-${Date.now()}`;
    console.log(`Setting up real-time channel: ${channelName}`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log("Real-time order update received:", payload);
        
        if (payload.new && typeof payload.new === 'object') {
          const updatedOrder = payload.new as Order;
          
          // Immediately update the progress value
          const newProgressValue = getOrderProgress(updatedOrder.status);
          console.log("Status updated to:", updatedOrder.status, "New progress value:", newProgressValue);
          
          setProgressValue(newProgressValue);
          
          // Update the order state with the new data
          setOrder(prev => {
            if (!prev) return null;
            
            // Preserve the items array from previous state to avoid issues with JSONB parsing
            const items = Array.isArray(prev.items) ? prev.items : [];
            
            return {
              ...updatedOrder,
              items
            };
          });
          
          // Show toast for status updates
          if (payload.old && payload.old.status !== updatedOrder.status) {
            if (updatedOrder.status === 'cancelled') {
              toast.error("Your order has been cancelled");
              // Navigate to orders page if cancelled
              if (updatedOrder.status === 'cancelled') {
                setTimeout(() => {
                  navigate("/student/orders/active");
                }, 3000);
              }
            } else if (updatedOrder.status === 'delivered') {
              toast.success("Your order has been delivered!");
              // Navigate to orders page if delivered
              setTimeout(() => {
                navigate("/student/orders/active");
              }, 3000);
            } else {
              toast.success(`Order status updated to: ${updatedOrder.status}`);
            }
          }
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to real-time updates for order:", id);
        } else {
          console.error("Failed to subscribe to real-time updates. Status:", status);
        }
      });
      
    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);
  
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
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-4 text-center">
          <div className="flex justify-start mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/orders/active" className="flex items-center gap-1">
                <ArrowLeft size={16} />
                Back to Orders
              </Link>
            </Button>
          </div>
          <div className="mt-20">
            <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="bg-[#ea384c] hover:bg-[#d02e40]">
              <Link to="/student/orders/active">View Your Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/orders/active" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Orders
            </Link>
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {!order ? (
            <div className="text-center py-4">
              <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
              <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or has been removed.</p>
              <Button asChild className="bg-[#ea384c] hover:bg-[#d02e40]">
                <Link to="/student/orders/active">View Your Orders</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Tracking Order #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground mb-6 flex items-center gap-2">
                <Clock size={16} />
                Estimated Delivery: {order.estimated_delivery_time || 'Waiting for confirmation'}
              </p>
              
              {order.status === 'cancelled' ? (
                <Card className="mb-6 bg-red-50 border-red-200">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Order Cancelled</h2>
                    <p className="text-red-600">
                      Sorry, your item was not available at the moment.
                    </p>
                    <Button asChild className="mt-4 bg-[#ea384c] hover:bg-[#d02e40]">
                      <Link to="/student/restaurants">Order Again</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="relative">
                    <Progress 
                      value={progressValue} 
                      className="h-2 mb-10 rounded bg-gray-200"
                    />
                    
                    <div className="flex justify-between -mt-6">
                      <div className={`flex flex-col items-center ${progressValue >= 0 ? 'text-green-500' : 'text-gray-400'}`}>
                        <div className={`rounded-full p-2 ${progressValue >= 0 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center`}>
                          <Check size={16} />
                        </div>
                        <span className="text-xs mt-1">Confirmed</span>
                      </div>
                      
                      <div className={`flex flex-col items-center ${progressValue >= 25 ? 'text-green-500' : 'text-gray-400'}`}>
                        <div className={`rounded-full p-2 ${progressValue >= 25 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center`}>
                          <ChefHat size={16} />
                        </div>
                        <span className="text-xs mt-1">Preparing</span>
                      </div>
                      
                      <div className={`flex flex-col items-center ${progressValue >= 50 ? 'text-green-500' : 'text-gray-400'}`}>
                        <div className={`rounded-full p-2 ${progressValue >= 50 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center`}>
                          <Package size={16} />
                        </div>
                        <span className="text-xs mt-1">Prepared</span>
                      </div>
                      
                      <div className={`flex flex-col items-center ${progressValue >= 75 ? 'text-green-500' : 'text-gray-400'}`}>
                        <div className={`rounded-full p-2 ${progressValue >= 75 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center`}>
                          <Truck size={16} />
                        </div>
                        <span className="text-xs mt-1">On the way</span>
                      </div>
                      
                      <div className={`flex flex-col items-center ${progressValue >= 100 ? 'text-green-500' : 'text-gray-400'}`}>
                        <div className={`rounded-full p-2 ${progressValue >= 100 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center`}>
                          <Check size={16} />
                        </div>
                        <span className="text-xs mt-1">Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Order Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Delivery Address:</p>
                      <div className="flex items-start text-sm">
                        <span>{order.delivery_location}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                {item.quantity}
                              </span>
                              {item.name}
                            </span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{(order.total_amount - 30).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Delivery Fee</span>
                        <span>₹30.00</span>
                      </div>
                      <div className="flex justify-between font-medium mt-3 text-base">
                        <span>Total</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
