
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ShoppingBag, Package } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import OrderCard from "@/components/OrderCard";

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
  restaurant_id: string; // Also used in some places
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
  restaurantName?: string;
}

const Orders = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (!sessionData?.session) {
          console.error("Session error:", sessionError);
          toast.error("Please login to view your orders");
          navigate("/student/login");
          return;
        }

        const studentId = sessionData.session.user.id;
        console.log("Fetching orders for student:", studentId);

        await fetchOrders(studentId);
      } catch (error) {
        console.error("Error in auth check:", error);
        toast.error("Authentication error");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [navigate]);

  const fetchOrders = async (studentId: string) => {
    try {
      // Fetch active orders - not delivered or cancelled
      const { data: active, error: activeError } = await supabase
        .from("orders")
        .select(`
          *,
          shops:shop_id(name)
        `)
        .eq("student_id", studentId)
        .not("status", "in", '("delivered", "cancelled")')
        .order("created_at", { ascending: false });

      if (activeError) {
        console.error("Error fetching active orders:", activeError);
        toast.error("Failed to load active orders");
      }

      // Fetch past orders - delivered or cancelled
      const { data: past, error: pastError } = await supabase
        .from("orders")
        .select(`
          *,
          shops:shop_id(name)
        `)
        .eq("student_id", studentId)
        .in("status", ["delivered", "cancelled"])
        .order("created_at", { ascending: false });

      if (pastError) {
        console.error("Error fetching past orders:", pastError);
        toast.error("Failed to load past orders");
      }

      // Parse orders and add restaurant name
      const parseOrders = (orders) => {
        if (!orders) return [];
        
        return orders.map((order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          restaurantName: order.shops?.name || "Unknown Restaurant"
        }));
      };

      const activeOrdersData = parseOrders(active);
      const pastOrdersData = parseOrders(past);
      
      console.log("Active orders:", activeOrdersData.length);
      console.log("Past orders:", pastOrdersData.length);

      setActiveOrders(activeOrdersData);
      setPastOrders(pastOrdersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    // Set up real-time subscription for order updates
    const setupRealtimeSubscription = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) return;
      
      const userId = sessionData.session.user.id;
      
      // Create a channel with a unique name to avoid conflicts
      const channelName = `student-orders-${userId}-${Math.random().toString(36).substring(2, 15)}`;
      console.log("Setting up student orders channel:", channelName);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `student_id=eq.${userId}`,
          },
          async (payload) => {
            console.log("Student received real-time order update:", payload);

            if (payload.eventType === "INSERT") {
              // Get restaurant name for the new order
              try {
                const { data: shopData } = await supabase
                  .from('shops')
                  .select('name')
                  .eq('id', (payload.new as Order).shop_id)
                  .single();
                  
                const newOrder = {
                  ...(payload.new as Order),
                  items: [],
                  restaurantName: shopData?.name || "Unknown Restaurant"
                };
                
                setActiveOrders((prev) => [newOrder, ...prev]);
              } catch (error) {
                console.error("Error processing new order:", error);
                
                // Fallback: add without restaurant name
                setActiveOrders((prev) => [payload.new as Order, ...prev]);
              }
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as Order;
              
              if (
                updated.status === "delivered" ||
                updated.status === "cancelled"
              ) {
                // Move order from active to past
                setActiveOrders((prev) => prev.filter((order) => order.id !== updated.id));
                
                // Try to get restaurant name
                try {
                  const { data: shopData } = await supabase
                    .from('shops')
                    .select('name')
                    .eq('id', updated.shop_id)
                    .single();

                  const updatedWithRestaurant = {
                    ...updated,
                    items: Array.isArray(updated.items) ? updated.items : [], 
                    restaurantName: shopData?.name || "Unknown Restaurant"
                  };
                  
                  setPastOrders((prev) => [updatedWithRestaurant, ...prev]);
                } catch (error) {
                  console.error("Error processing order update:", error);
                  
                  // Fallback: add to past orders without restaurant name
                  setPastOrders((prev) => [updated, ...prev]);
                }
                
                if (updated.status === "delivered") {
                  toast.success("Your order has been delivered!");
                } else if (updated.status === "cancelled") {
                  toast.error("Your order has been cancelled.");
                }
              } else {
                // Update the order in active list
                setActiveOrders((prev) =>
                  prev.map((order) =>
                    order.id === updated.id
                      ? { 
                          ...updated, 
                          items: Array.isArray(order.items) ? order.items : [],
                          restaurantName: order.restaurantName 
                        }
                      : order
                  )
                );
                
                // Show status update toast
                toast.success(`Order status updated to: ${updated.status}`);
              }
            } else if (payload.eventType === "DELETE") {
              if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
                const oldId = payload.old.id;
                setActiveOrders((prev) => prev.filter((order) => order.id !== oldId));
                setPastOrders((prev) => prev.filter((order) => order.id !== oldId));
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Student orders subscription status:", status);
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to student orders real-time updates");
          } else {
            console.error("Failed to subscribe to student orders real-time updates. Status:", status);
          }
        });

      return () => {
        console.log("Cleaning up student orders subscription");
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-4 text-center mt-20">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Current Orders
              {activeOrders.length > 0 && (
                <Badge className="ml-2 bg-blue-500">{activeOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Orders
              {pastOrders.length > 0 && (
                <Badge className="ml-2 bg-gray-500">{pastOrders.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-4">
                <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-muted-foreground">
                  No active orders at the moment
                </p>
                <Button
                  onClick={() => navigate("/student/restaurants")}
                  className="mt-4"
                >
                  Order Now
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastOrders.length > 0 ? (
              pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-4">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-muted-foreground">No past orders yet</p>
                <Button
                  onClick={() => navigate("/student/restaurants")}
                  className="mt-4"
                >
                  Order Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
