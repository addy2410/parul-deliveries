
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Community = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderNotifications, setNewOrderNotifications] = useState([]);

  // Memoized function to fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch orders that are at least in pending status (meaning they've clicked "Proceed to Payment")
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          student_name,
          restaurant_id,
          items,
          total_amount,
          created_at,
          shops:restaurant_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Could not load community orders");
        setOrders([]);
      } else {
        console.log("Fetched orders:", data);
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching orders:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up real-time subscription for new orders
  useEffect(() => {
    // Subscribe to real-time changes on the orders table
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log("New order received via real-time:", payload);
          
          // Fetch the complete order with shop name
          try {
            const { data, error } = await supabase
              .from("orders")
              .select(`
                id,
                student_name,
                restaurant_id,
                items,
                total_amount,
                created_at,
                shops:restaurant_id(name)
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (error) {
              console.error("Error fetching new order details:", error);
            } else if (data) {
              console.log("New order details:", data);
              
              // Add notification for the new order
              setNewOrderNotifications(prev => [data, ...prev].slice(0, 10));
              
              // Update orders list to include the new order
              setOrders(prevOrders => [data, ...prevOrders]);
              
              // Show toast notification
              toast.success(`New order from ${data.student_name}`);
            }
          } catch (err) {
            console.error("Error processing new order notification:", err);
          }
        }
      )
      .subscribe();
    
    // Cleanup function to remove the channel subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle manual refresh - memoized
  const handleRefresh = useCallback(() => {
    fetchOrders();
    toast.info("Orders refreshed");
  }, [fetchOrders]);

  // Memoize the empty state to prevent unnecessary re-renders
  const emptyState = useMemo(() => (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <p className="text-gray-500 mb-4">No orders found yet. Be the first to order!</p>
      <Button asChild>
        <Link to="/student/restaurants">Browse Restaurants</Link>
      </Button>
    </div>
  ), []);

  // Memoize the loading state
  const loadingState = useMemo(() => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-gray-100 animate-pulse h-32">
          <CardContent className="p-6"></CardContent>
        </Card>
      ))}
    </div>
  ), []);

  // Format date safely with memoization
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  }, []);

  // Format time safely with memoization
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      console.error("Time formatting error:", error);
      return '';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold fontLogo text-primary">
              CampusGrub
            </span>
          </Link>

          <Button variant="outline" size="sm" asChild>
            <Link to="/student/restaurants">
              <Home className="h-4 w-4 mr-2" />
              Back to Restaurants
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Our Community Orders</h1>
            <p className="text-gray-600 mt-2">
              See what others in our campus community are ordering. Join the foodie movement!
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Real-time notifications display */}
        {newOrderNotifications.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="font-semibold text-primary">Live Order Activity</h3>
            {newOrderNotifications.map((order, index) => (
              <div 
                key={`notification-${order.id}`} 
                className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-in fade-in slide-in-from-top duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{order.student_name}</span> ordered 
                  {Array.isArray(order.items) && order.items.length > 0 
                    ? ` ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}` 
                    : ' items'} 
                  for <span className="font-medium">₹{order.total_amount?.toFixed(2)}</span> including delivery fees 
                  from <span className="font-medium">{order.shops?.name || 'Unknown Restaurant'}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(order.created_at)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          loadingState
        ) : orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="font-medium">{order.student_name}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        ordered from <span className="font-medium">{order.shops?.name || 'Unknown Restaurant'}</span>
                      </p>
                      {order.total_amount && (
                        <p className="text-sm text-gray-700 mb-2">
                          for <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                      <h4 className="text-sm font-medium mb-2">Order Items:</h4>
                      <ul className="text-sm">
                        {Array.isArray(order.items) && order.items.map((item, index) => (
                          <li key={index} className="mb-1">
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default Community;
