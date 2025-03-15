
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Check, ChefHat, Truck, AlertTriangle, Clock } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Order, OrderStatusHistory } from "@/components/vendor/types";

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const orderChannelRef = useRef<any>(null);
  const historyChannelRef = useRef<any>(null);
  
  // This function accepts a status parameter so it can work without relying on the order state
  const calculateProgress = (status: string): number => {
    const statusValues = {
      'pending': 10,
      'preparing': 30,
      'prepared': 50,
      'delivering': 75,
      'delivered': 100,
      'cancelled': 0
    };
    return statusValues[status] || 0;
  };
  
  useEffect(() => {
    if (!id) {
      console.error("No order ID provided in URL");
      toast.error("Order ID is missing");
      navigate("/student/orders/active");
      return;
    }
    
    console.log("OrderTracking component mounted with order ID:", id);
    
    // First fetch current order status and history
    const fetchOrderDetails = async () => {
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
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (orderError) {
          console.error("Error fetching order:", orderError);
          toast.error("Failed to load order");
          return;
        }
        
        console.log("Order data received:", orderData);
        
        if (!orderData) {
          console.error("No order found with ID:", id);
          toast.error("Order not found");
          return;
        }
        
        const orderWithItems = {
          ...orderData,
          items: Array.isArray(orderData.items) ? orderData.items : [],
          status: orderData.status as Order['status']
        };
        
        setOrder(orderWithItems);
        
        // Also fetch status history for progress calculation
        const { data: historyData, error: historyError } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', id)
          .order('timestamp', { ascending: true });
        
        if (historyError) {
          console.error("Error fetching order history:", historyError);
        } else if (historyData && historyData.length > 0) {
          console.log("Order history received:", historyData);
          setStatusHistory(historyData.map(item => ({
            ...item,
            status: item.status as Order['status']
          })));
          
          // Use the latest status from history, or fall back to order status
          const latestStatus = historyData[historyData.length - 1]?.status || orderWithItems.status;
          const newProgressValue = calculateProgress(latestStatus);
          setProgressValue(newProgressValue);
          console.log("Initial order status:", latestStatus, "Progress value:", newProgressValue);
        } else {
          // If no history, use the order status directly
          const newProgressValue = calculateProgress(orderWithItems.status);
          setProgressValue(newProgressValue);
          console.log("No history, using order status:", orderWithItems.status, "Progress value:", newProgressValue);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
    
    // Subscribe to order updates
    const orderChannelName = `order-${id}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up order channel: ${orderChannelName}`);
    
    const orderChannel = supabase
      .channel(orderChannelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log("Real-time order update received:", payload);
        
        if (payload.new && typeof payload.new === 'object') {
          const updatedOrder = payload.new as Order;
          
          // Update the order state with the new data
          setOrder(prev => {
            if (!prev) return null;
            
            // Preserve the items array from previous state to avoid issues with JSONB parsing
            const items = Array.isArray(prev.items) ? prev.items : [];
            
            return {
              ...updatedOrder,
              items,
              status: updatedOrder.status as Order['status']
            };
          });
          
          // Show toast for status updates
          if (payload.old && payload.old.status !== updatedOrder.status) {
            if (updatedOrder.status === 'cancelled') {
              toast.error("Your order has been cancelled");
              // Navigate to orders page if cancelled
              setTimeout(() => {
                navigate("/student/orders/active");
              }, 3000);
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
        console.log("Order subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to order updates");
        } else {
          console.error("Failed to subscribe to order updates. Status:", status);
        }
      });
    
    orderChannelRef.current = orderChannel;
    
    // CRITICAL: Also subscribe to status history updates
    const historyChannelName = `order-history-${id}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Setting up order history channel: ${historyChannelName}`);
    
    const historyChannel = supabase
      .channel(historyChannelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_status_history',
        filter: `order_id=eq.${id}`
      }, (payload) => {
        console.log("Real-time order history update received:", payload);
        
        if (payload.new && typeof payload.new === 'object') {
          const newHistoryEntry = payload.new as OrderStatusHistory;
          
          // Add the new status history entry
          setStatusHistory(prev => [...prev, {
            ...newHistoryEntry,
            status: newHistoryEntry.status as Order['status']
          }]);
          
          // Update progress based on the new status
          const newProgress = calculateProgress(newHistoryEntry.status);
          console.log("New status from history:", newHistoryEntry.status, "New progress value:", newProgress);
          
          // Animate progress value change
          animateProgressValue(progressValue, newProgress);
        }
      })
      .subscribe((status) => {
        console.log("Order history subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to order history updates");
        } else {
          console.error("Failed to subscribe to order history updates. Status:", status);
        }
      });
    
    historyChannelRef.current = historyChannel;
      
    return () => {
      console.log("Cleaning up real-time subscriptions");
      if (orderChannelRef.current) {
        supabase.removeChannel(orderChannelRef.current);
      }
      if (historyChannelRef.current) {
        supabase.removeChannel(historyChannelRef.current);
      }
    };
  }, [id, navigate]);
  
  // Function to animate progress value changes for a smoother experience
  const animateProgressValue = (startValue: number, endValue: number) => {
    const duration = 500; // ms
    const frameRate = 20; // ms
    const steps = duration / frameRate;
    const increment = (endValue - startValue) / steps;
    
    let currentStep = 0;
    let currentValue = startValue;
    
    const animate = () => {
      currentStep++;
      currentValue += increment;
      
      if (currentStep >= steps) {
        setProgressValue(endValue);
        return;
      }
      
      setProgressValue(currentValue);
      setTimeout(animate, frameRate);
    };
    
    animate();
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
            <>
              <h1 className="text-2xl font-bold mb-2">Tracking Order #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground mb-6 flex items-center gap-2">
                <Clock size={16} />
                Estimated Delivery: {order.estimated_delivery_time || 'Waiting for confirmation'}
              </p>
              
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="relative">
                  <Progress 
                    value={progressValue} 
                    className="h-2 mb-10 rounded bg-gray-200 transition-all duration-500 ease-in-out"
                  />
                  
                  <div className="flex justify-between -mt-6">
                    <div className={`flex flex-col items-center ${progressValue >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
                      <div className={`rounded-full p-2 ${progressValue >= 10 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center transition-colors duration-300`}>
                        <Check size={16} />
                      </div>
                      <span className="text-xs mt-1">Confirmed</span>
                    </div>
                    
                    <div className={`flex flex-col items-center ${progressValue >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
                      <div className={`rounded-full p-2 ${progressValue >= 30 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center transition-colors duration-300`}>
                        <ChefHat size={16} />
                      </div>
                      <span className="text-xs mt-1">Preparing</span>
                    </div>
                    
                    <div className={`flex flex-col items-center ${progressValue >= 50 ? 'text-green-500' : 'text-gray-400'}`}>
                      <div className={`rounded-full p-2 ${progressValue >= 50 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center transition-colors duration-300`}>
                        <Package size={16} />
                      </div>
                      <span className="text-xs mt-1">Prepared</span>
                    </div>
                    
                    <div className={`flex flex-col items-center ${progressValue >= 75 ? 'text-green-500' : 'text-gray-400'}`}>
                      <div className={`rounded-full p-2 ${progressValue >= 75 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center transition-colors duration-300`}>
                        <Truck size={16} />
                      </div>
                      <span className="text-xs mt-1">On the way</span>
                    </div>
                    
                    <div className={`flex flex-col items-center ${progressValue >= 100 ? 'text-green-500' : 'text-gray-400'}`}>
                      <div className={`rounded-full p-2 ${progressValue >= 100 ? 'bg-green-500' : 'bg-gray-300'} text-white w-8 h-8 flex items-center justify-center transition-colors duration-300`}>
                        <Check size={16} />
                      </div>
                      <span className="text-xs mt-1">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
