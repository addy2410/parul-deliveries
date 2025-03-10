
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, ShoppingBag, Package, ChefHat, Truck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import StudentHeader from "@/components/StudentHeader";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  restaurant_id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
}

const OrderCard = ({ order }: { order: Order }) => {
  return (
    <Card className="border border-border/40">
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
          <Badge
            className={`${
              order.status === "pending"
                ? "bg-yellow-500"
                : order.status === "preparing"
                ? "bg-blue-500"
                : order.status === "ready"
                ? "bg-purple-500"
                : order.status === "delivering"
                ? "bg-orange-500"
                : order.status === "delivered"
                ? "bg-green-500"
                : "bg-gray-500"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="mb-2">
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
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>₹{(item.quantity * item.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/40 pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Orders = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("[StudentOrders] Fetching orders");

      // Check if user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        console.log("[StudentOrders] No active session found");
        toast.error("Please login to view your orders");
        navigate("/student/login");
        return;
      }

      const studentId = sessionData.session.user.id;
      console.log("[StudentOrders] Fetching orders for student:", studentId);

      // Fetch active orders
      const { data: active, error: activeError } = await supabase
        .from("orders")
        .select("*")
        .eq("student_id", studentId)
        .in("status", ["pending", "preparing", "ready", "delivering"])
        .order("created_at", { ascending: false });

      if (activeError) {
        console.error("[StudentOrders] Error fetching active orders:", activeError);
        toast.error("Failed to load active orders");
      } else {
        console.log("[StudentOrders] Fetched active orders:", active?.length || 0, active);
      }

      // Fetch past orders
      const { data: past, error: pastError } = await supabase
        .from("orders")
        .select("*")
        .eq("student_id", studentId)
        .in("status", ["delivered", "cancelled"])
        .order("created_at", { ascending: false });

      if (pastError) {
        console.error("[StudentOrders] Error fetching past orders:", pastError);
        toast.error("Failed to load past orders");
      } else {
        console.log("[StudentOrders] Fetched past orders:", past?.length || 0, past);
      }

      // Parse JSONB items field
      const parseOrders = (orders) => {
        return orders
          ? orders.map((order) => {
              // Parse items if they're a string
              let parsedItems = [];
              try {
                parsedItems = typeof order.items === 'string' 
                  ? JSON.parse(order.items) 
                  : (Array.isArray(order.items) ? order.items : []);
              } catch (e) {
                console.error("[StudentOrders] Error parsing items for order:", order.id, e);
                parsedItems = [];
              }
              
              return {
                ...order,
                items: parsedItems
              };
            })
          : [];
      };

      setActiveOrders(parseOrders(active));
      setPastOrders(parseOrders(past));
    } catch (error) {
      console.error("[StudentOrders] Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const setupRealtimeSubscription = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        const userId = sessionData.session.user.id;
        const channelId = `student-orders-${userId}-${Date.now()}`;
        console.log(`[StudentOrders] Setting up real-time channel: ${channelId}`);
        
        const channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `student_id=eq.${userId}`,
            },
            (payload) => {
              console.log("[StudentOrders] Real-time order update received:", payload);

              // Ensure we have a valid payload
              if (!payload || typeof payload !== 'object') {
                console.error("[StudentOrders] Invalid payload received:", payload);
                return;
              }

              // Parse items if they're a string
              let parsedItems: OrderItem[] = [];
              
              try {
                // Safely check if payload.new exists and has items property
                if (payload.new && typeof payload.new === 'object' && 'items' in payload.new) {
                  const itemsData = payload.new.items;
                  parsedItems = typeof itemsData === 'string' 
                    ? JSON.parse(itemsData) 
                    : (Array.isArray(itemsData) ? itemsData : []);
                }
              } catch (e) {
                console.error("[StudentOrders] Error parsing items for real-time update:", e);
                parsedItems = [];
              }
              
              if (payload.eventType === 'INSERT') {
                // Safely access payload.new with type checking
                if (payload.new && typeof payload.new === 'object') {
                  const newOrder = {
                    ...payload.new as Order,
                    items: parsedItems
                  };
                  
                  // Add to appropriate list based on status
                  if (['pending', 'preparing', 'ready', 'delivering'].includes(newOrder.status)) {
                    console.log("[StudentOrders] Adding new order to active list:", newOrder.id);
                    setActiveOrders(prev => [newOrder, ...prev]);
                    toast.success("New order created!");
                  } else {
                    console.log("[StudentOrders] Adding new order to past list:", newOrder.id);
                    setPastOrders(prev => [newOrder, ...prev]);
                  }
                }
              } 
              else if (payload.eventType === 'UPDATE') {
                // Safely access payload.new with type checking
                if (payload.new && typeof payload.new === 'object') {
                  const updatedOrder = {
                    ...payload.new as Order,
                    items: parsedItems
                  };
                  
                  console.log("[StudentOrders] Order updated:", updatedOrder.id, "New status:", updatedOrder.status);
                  
                  if (['delivered', 'cancelled'].includes(updatedOrder.status)) {
                    // Move from active to past orders
                    setActiveOrders(prev => prev.filter(order => order.id !== updatedOrder.id));
                    
                    // Check if already in past orders
                    setPastOrders(prev => {
                      const exists = prev.some(order => order.id === updatedOrder.id);
                      return exists 
                        ? prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
                        : [updatedOrder, ...prev];
                    });
                    
                    // Show a toast notification for status change
                    if (updatedOrder.status === 'delivered') {
                      toast.success('Your order has been delivered!');
                    } else if (updatedOrder.status === 'cancelled') {
                      toast.error('Your order has been cancelled');
                    }
                  } 
                  else if (['pending', 'preparing', 'ready', 'delivering'].includes(updatedOrder.status)) {
                    // Update in active orders
                    setActiveOrders(prev => {
                      // Check if order exists in active list
                      const exists = prev.some(order => order.id === updatedOrder.id);
                      if (exists) {
                        return prev.map(order => order.id === updatedOrder.id ? updatedOrder : order);
                      } else {
                        // If not in active orders (e.g., page just loaded), add it
                        return [updatedOrder, ...prev];
                      }
                    });
                    
                    // Remove from past orders if previously delivered/cancelled
                    setPastOrders(prev => prev.filter(order => order.id !== updatedOrder.id));
                    
                    // Show a toast for status update
                    toast.info(`Order status updated: ${updatedOrder.status}`);
                  }
                }
              } 
              else if (payload.eventType === 'DELETE') {
                // Safely access payload.old if needed
                if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
                  const oldId = payload.old.id;
                  console.log("[StudentOrders] Order deleted:", oldId);
                  
                  // Remove from both lists to be safe
                  setActiveOrders(prev => prev.filter(order => order.id !== oldId));
                  setPastOrders(prev => prev.filter(order => order.id !== oldId));
                  
                  toast.info("An order has been removed");
                }
              }
            }
          )
          .subscribe((status) => {
            console.log("[StudentOrders] Subscription status:", status);
          });

        return () => {
          console.log("[StudentOrders] Cleaning up subscription");
          supabase.removeChannel(channel);
        };
      }
    };
    
    setupRealtimeSubscription();
  }, [navigate]);

  const renderOrderCard = (order) => (
    <div key={order.id} className="mb-4">
      <OrderCard order={order} />
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            className="bg-[#ea384c] hover:bg-[#d02e40]"
            onClick={() => navigate(`/student/order-tracking/${order.id}`)}
          >
            Track Order
          </Button>
        </div>
      )}
    </div>
  );

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
            <TabsTrigger value="active">Current Orders</TabsTrigger>
            <TabsTrigger value="past">Past Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => renderOrderCard(order))
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
                <div key={order.id} className="mb-4">
                  <OrderCard order={order} />
                </div>
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
