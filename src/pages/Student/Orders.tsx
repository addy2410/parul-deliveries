
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import StudentHeader from "@/components/StudentHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
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

const StudentOrders = () => {
  const { type } = useParams<{ type: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Try to get from localStorage as fallback (for development)
        const storedSession = localStorage.getItem('studentSession');
        if (storedSession) {
          try {
            const session = JSON.parse(storedSession);
            setStudentId(session.userId);
          } catch (e) {
            console.error("Error parsing stored session:", e);
          }
        }
        return;
      }
      
      setStudentId(data.session.user.id);
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (!studentId) return;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Get active or previous orders based on type
        const isActive = type === 'active';
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            shops!inner(name)
          `)
          .eq('student_id', studentId)
          .in('status', isActive 
            ? ['pending', 'preparing', 'ready', 'delivering'] 
            : ['delivered', 'cancelled'])
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
          return;
        }
        
        // Process orders data
        const formattedOrders = data.map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          restaurantName: order.shops?.name || 'Unknown Restaurant'
        }));
        
        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Set up real-time subscription for order updates
    if (studentId) {
      const channel = supabase
        .channel('student-orders-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `student_id=eq.${studentId}`
        }, async (payload) => {
          // Fetch restaurant name for this order
          let restaurantName = 'Unknown Restaurant';
          try {
            const { data } = await supabase
              .from('shops')
              .select('name')
              .eq('id', payload.new.shop_id)
              .single();
              
            if (data) {
              restaurantName = data.name;
            }
          } catch (e) {
            console.error("Error fetching shop name:", e);
          }
          
          if (payload.eventType === 'INSERT') {
            const newOrder = {
              ...payload.new,
              items: Array.isArray(payload.new.items) ? payload.new.items : [],
              restaurantName
            };
            
            // Only add to list if it matches the current filter
            const isActive = ['pending', 'preparing', 'ready', 'delivering'].includes(newOrder.status);
            if ((type === 'active' && isActive) || (type === 'previous' && !isActive)) {
              setOrders(prev => [newOrder, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = {
              ...payload.new,
              items: Array.isArray(payload.new.items) ? payload.new.items : [],
              restaurantName
            };
            
            // Check if status changed from active to completed/cancelled or vice versa
            const wasActive = ['pending', 'preparing', 'ready', 'delivering'].includes(payload.old.status);
            const isActive = ['pending', 'preparing', 'ready', 'delivering'].includes(updatedOrder.status);
            
            if (wasActive !== isActive) {
              // Order moved between active and previous
              if ((type === 'active' && !isActive) || (type === 'previous' && isActive)) {
                // Order should be removed from current view
                setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
              } else {
                // Order should be added to current view
                setOrders(prev => [updatedOrder, ...prev]);
              }
            } else {
              // Just update the order in the current view
              setOrders(prev => prev.map(o => 
                o.id === updatedOrder.id ? updatedOrder : o
              ));
            }
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [studentId, type]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/restaurants" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">
          {type === 'active' ? 'Active Orders' : 'Order History'}
        </h1>
        
        <Tabs defaultValue={type} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger 
              value="active" 
              asChild
            >
              <Link to="/student/orders/active">Active Orders</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="previous"
              asChild
            >
              <Link to="/student/orders/previous">Order History</Link>
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="text-center py-8">
                <p>Loading orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    isVendor={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-center text-muted-foreground">
                    {type === 'active' 
                      ? "You don't have any active orders."
                      : "You don't have any previous orders."
                    }
                  </p>
                  <Button 
                    className="mt-4 bg-[#ea384c] hover:bg-[#d02e40]"
                    asChild
                  >
                    <Link to="/student/restaurants">Order Food Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentOrders;
