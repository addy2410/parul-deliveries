
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import StudentHeader from "@/components/StudentHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Define Order type that matches our database structure
interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface DbOrder {
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

// Convert DB order to format expected by OrderCard component
const mapDbOrderToOrder = (dbOrder: DbOrder) => {
  return {
    id: dbOrder.id,
    restaurantId: dbOrder.restaurant_id,
    customerId: dbOrder.student_id,
    customerName: dbOrder.student_name,
    items: dbOrder.items,
    totalAmount: dbOrder.total_amount,
    status: dbOrder.status,
    createdAt: dbOrder.created_at,
    deliveryLocation: dbOrder.delivery_location,
    estimatedDeliveryTime: dbOrder.estimated_delivery_time
  };
};

const StudentOrders = () => {
  const { type = 'active' } = useParams<{ type: string }>();
  const [orders, setOrders] = useState<ReturnType<typeof mapDbOrderToOrder>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  
  useEffect(() => {
    const fetchStudentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get student user details
        const { data: studentData, error: studentError } = await supabase
          .from('student_users')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (studentData) {
          setStudentName(studentData.name);
        } else if (studentError) {
          console.error('Error fetching student profile:', studentError);
        }
      }
    };
    
    fetchStudentProfile();
  }, []);
  
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("You must be logged in to view orders");
          setIsLoading(false);
          return;
        }
        
        // Determine which orders to fetch based on type
        const isActive = type === 'active';
        const statusFilter = isActive 
          ? ['pending', 'accepted', 'preparing', 'ready', 'delivering']
          : ['delivered', 'cancelled'];
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('student_id', user.id)
          .in('status', statusFilter)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map DB orders to component format
          const mappedOrders = data.map(mapDbOrderToOrder);
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
    
    // Set up realtime subscription for order updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        }, 
        (payload) => {
          console.log('Order changed:', payload);
          // Refresh orders when a change is detected
          fetchOrders();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader studentName={studentName} />
      
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
            {isLoading ? (
              <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin" />
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
