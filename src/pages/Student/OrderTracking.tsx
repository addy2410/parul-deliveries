
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Check, ChefHat, Truck, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StudentHeader from "@/components/StudentHeader";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      
      try {
        if (!id) {
          toast.error("Order ID is missing");
          return;
        }
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setOrder(data);
        } else {
          toast.error("Order not found");
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error("Failed to load order tracking information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
    
    // Set up realtime subscription for order status updates
    const channel = supabase
      .channel('order-tracking')
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        }, 
        (payload) => {
          console.log('Order status updated:', payload);
          if (payload.new) {
            setOrder(payload.new as Order);
            
            // Show toast notification on status change
            const newStatus = (payload.new as Order).status;
            const oldStatus = (payload.old as Order).status;
            
            if (newStatus !== oldStatus) {
              switch(newStatus) {
                case 'accepted':
                  toast.success("Restaurant has accepted your order!");
                  break;
                case 'preparing':
                  toast.success("Your order is being prepared!");
                  break;
                case 'ready':
                  toast.success("Your order is ready for delivery!");
                  break;
                case 'delivering':
                  toast.success("Your order is on the way!");
                  break;
                case 'delivered':
                  toast.success("Your order has been delivered!");
                  break;
                case 'cancelled':
                  toast.error("Your order has been cancelled");
                  break;
              }
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-4 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
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
  
  const getOrderProgress = () => {
    switch(order.status) {
      case 'pending': return 0;
      case 'accepted': return 20;
      case 'preparing': return 40;
      case 'ready': return 60;
      case 'delivering': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };
  
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
          <h1 className="text-2xl font-bold mb-2">Tracking Order #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground mb-6 flex items-center gap-2">
            <Clock size={16} />
            Estimated Delivery: {order.estimated_delivery_time}
          </p>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-10 text-xs flex rounded bg-gray-200">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${getOrderProgress()}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-[#ea384c]'
                  }`}
                />
              </div>
              
              <div className="flex justify-between -mt-6">
                <div className={`flex flex-col items-center ${
                  ['accepted', 'preparing', 'ready', 'delivering', 'delivered'].includes(order.status) ? 'text-green-500' : 
                  order.status === 'cancelled' ? 'text-red-500' : 'text-[#ea384c]'
                }`}>
                  <div className={`rounded-full p-2 ${
                    ['accepted', 'preparing', 'ready', 'delivering', 'delivered'].includes(order.status) ? 'bg-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-[#ea384c]'
                  } text-white w-8 h-8 flex items-center justify-center`}>
                    {['accepted', 'preparing', 'ready', 'delivering', 'delivered'].includes(order.status) ? 
                      <Check size={16} /> : <Package size={16} />}
                  </div>
                  <span className="text-xs mt-1">Confirmed</span>
                </div>
                
                <div className={`flex flex-col items-center ${
                  order.status === 'preparing' ? 'text-[#ea384c]' : 
                  ['ready', 'delivering', 'delivered'].includes(order.status) ? 'text-green-500' : 
                  order.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full p-2 ${
                    order.status === 'preparing' ? 'bg-[#ea384c]' : 
                    ['ready', 'delivering', 'delivered'].includes(order.status) ? 'bg-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                  } text-white w-8 h-8 flex items-center justify-center`}>
                    <ChefHat size={16} />
                  </div>
                  <span className="text-xs mt-1">Preparing</span>
                </div>
                
                <div className={`flex flex-col items-center ${
                  order.status === 'ready' ? 'text-[#ea384c]' : 
                  ['delivering', 'delivered'].includes(order.status) ? 'text-green-500' : 
                  order.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full p-2 ${
                    order.status === 'ready' ? 'bg-[#ea384c]' : 
                    ['delivering', 'delivered'].includes(order.status) ? 'bg-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                  } text-white w-8 h-8 flex items-center justify-center`}>
                    <Package size={16} />
                  </div>
                  <span className="text-xs mt-1">Ready</span>
                </div>
                
                <div className={`flex flex-col items-center ${
                  order.status === 'delivering' ? 'text-[#ea384c]' : 
                  order.status === 'delivered' ? 'text-green-500' : 
                  order.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full p-2 ${
                    order.status === 'delivering' ? 'bg-[#ea384c]' : 
                    order.status === 'delivered' ? 'bg-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                  } text-white w-8 h-8 flex items-center justify-center`}>
                    <Truck size={16} />
                  </div>
                  <span className="text-xs mt-1">On the way</span>
                </div>
                
                <div className={`flex flex-col items-center ${
                  order.status === 'delivered' ? 'text-green-500' : 
                  order.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full p-2 ${
                    order.status === 'delivered' ? 'bg-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                  } text-white w-8 h-8 flex items-center justify-center`}>
                    <Check size={16} />
                  </div>
                  <span className="text-xs mt-1">Delivered</span>
                </div>
              </div>
            </div>
          </div>
          
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
