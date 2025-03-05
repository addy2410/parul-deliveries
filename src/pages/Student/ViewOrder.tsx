
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

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

const ViewOrder = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  
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
          
          // Set initial progress based on status
          switch(data.status) {
            case 'pending': setDeliveryProgress(10); break;
            case 'accepted': setDeliveryProgress(20); break;
            case 'preparing': setDeliveryProgress(40); break;
            case 'ready': setDeliveryProgress(60); break;
            case 'delivering': setDeliveryProgress(80); break;
            case 'delivered': setDeliveryProgress(100); break;
            default: setDeliveryProgress(0);
          }
        } else {
          toast.error("Order not found");
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
    
    // Set up realtime subscription for order status updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        }, 
        (payload) => {
          console.log('Order updated:', payload);
          // Update local order state when changes are detected
          if (payload.new) {
            setOrder(payload.new as Order);
            
            // Update progress based on new status
            switch((payload.new as Order).status) {
              case 'pending': setDeliveryProgress(10); break;
              case 'accepted': setDeliveryProgress(20); break;
              case 'preparing': setDeliveryProgress(40); break;
              case 'ready': setDeliveryProgress(60); break;
              case 'delivering': setDeliveryProgress(80); break;
              case 'delivered': setDeliveryProgress(100); break;
              default: setDeliveryProgress(0);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
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
  
  const getStatusText = () => {
    switch(order.status) {
      case 'pending': return 'Restaurant is confirming your order';
      case 'accepted': return 'Restaurant has accepted your order';
      case 'preparing': return 'Chef is preparing your food';
      case 'ready': return 'Your order is ready for delivery';
      case 'delivering': return 'Your order is on the way';
      case 'delivered': return 'Your order has been delivered';
      case 'cancelled': return 'Your order has been cancelled';
      default: return 'Unknown status';
    }
  };
  
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
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <motion.div 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${deliveryProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{getStatusText()}</p>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated delivery: {order.estimated_delivery_time}
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
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground">+91 98765 43210</p>
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
                  <Button className="w-full bg-[#ea384c] hover:bg-[#d02e40]">
                    Reorder
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
