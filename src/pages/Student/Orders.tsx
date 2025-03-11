
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
import { ArrowLeft, ShoppingBag, Package, Check, ChefHat, Truck, AlertTriangle } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
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
                : order.status === "prepared"
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (!sessionData?.session) {
          toast.error("Please login to view your orders");
          navigate("/student/login");
          return;
        }

        const studentId = sessionData.session.user.id;

        // Fetch active orders - not delivered or cancelled
        const { data: active, error: activeError } = await supabase
          .from("orders")
          .select("*")
          .eq("student_id", studentId)
          .not("status", "in", '("delivered", "cancelled")')
          .order("created_at", { ascending: false });

        if (activeError) {
          console.error("Error fetching active orders:", activeError);
        }

        // Fetch past orders - delivered or cancelled
        const { data: past, error: pastError } = await supabase
          .from("orders")
          .select("*")
          .eq("student_id", studentId)
          .in("status", ["delivered", "cancelled"])
          .order("created_at", { ascending: false });

        if (pastError) {
          console.error("Error fetching past orders:", pastError);
        }

        // Parse JSONB items field
        const parseOrders = (orders) => {
          return orders
            ? orders.map((order) => ({
                ...order,
                items: Array.isArray(order.items) ? order.items : [],
              }))
            : [];
        };

        setActiveOrders(parseOrders(active));
        setPastOrders(parseOrders(past));
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to real-time updates
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        const userId = sessionData.session.user.id;
        
        const channel = supabase
          .channel("student-orders")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `student_id=eq.${userId}`,
            },
            (payload) => {
              console.log("Student received real-time order update:", payload);

              if (payload.eventType === "INSERT") {
                setActiveOrders((prev) => [payload.new as Order, ...prev]);
              } else if (payload.eventType === "UPDATE") {
                const updated = payload.new as Order;
                if (
                  updated.status === "delivered" ||
                  updated.status === "cancelled"
                ) {
                  // Move order from active to past
                  setActiveOrders((prev) =>
                    prev.filter((order) => order.id !== updated.id)
                  );
                  setPastOrders((prev) => [updated, ...prev]);
                } else {
                  // Update the order in active list
                  setActiveOrders((prev) =>
                    prev.map((order) =>
                      order.id === updated.id
                        ? { ...updated, items: order.items }
                        : order
                    )
                  );
                }
              } else if (payload.eventType === "DELETE") {
                // Safe type checking for payload.old
                if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
                  const oldId = payload.old.id;
                  if (oldId) {
                    setActiveOrders((prev) => prev.filter((order) => order.id !== oldId));
                    setPastOrders((prev) => prev.filter((order) => order.id !== oldId));
                  }
                } else {
                  console.error("Invalid payload.old structure:", payload.old);
                }
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    
    fetchSession();
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
