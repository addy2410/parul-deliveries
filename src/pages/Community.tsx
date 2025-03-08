
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User, Home, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all orders with restaurant names, sort by most recent
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          student_name,
          restaurant_id,
          items,
          total_amount,
          created_at,
          status,
          shops:restaurant_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Could not load community orders. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Fetched orders:", data);
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching orders:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchOrders();
    toast({
      title: "Refreshed",
      description: "Community orders have been updated.",
    });
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();
    
    // Set up realtime subscription for new orders
    const channel = supabase
      .channel('order-notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // When a new order is created or updated, fetch the complete order details including the restaurant name
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const fetchNewOrder = async () => {
              const { data, error } = await supabase
                .from("orders")
                .select(`
                  id,
                  student_name,
                  restaurant_id,
                  items,
                  total_amount,
                  created_at,
                  status,
                  shops:restaurant_id(name)
                `)
                .eq('id', payload.new.id)
                .single();
                
              if (!error && data) {
                // Add to existing orders (ensuring no duplicates)
                setOrders(prevOrders => {
                  // Check if order already exists in the array
                  const orderExists = prevOrders.some(order => order.id === data.id);
                  
                  if (orderExists) {
                    // Update the existing order
                    return prevOrders.map(order => 
                      order.id === data.id ? data : order
                    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  } else {
                    // Add new order at the top 
                    return [data, ...prevOrders]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  }
                });
                
                // Show a toast notification for new orders
                if (payload.eventType === 'INSERT') {
                  toast({
                    title: "New Order!",
                    description: `${data.student_name} just ordered from ${data.shops?.name || 'Unknown Restaurant'}`,
                  });
                }
              }
            };
            
            fetchNewOrder();
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted order from the state
            setOrders(prevOrders => 
              prevOrders.filter(order => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to realtime updates');
          toast({
            title: "Notification",
            description: "Live updates might be delayed. Using automatic refresh.",
            variant: "default",
          });
        }
      });
    
    // Set up a timer to refresh data every 60 seconds as a fallback
    const intervalId = setInterval(fetchOrders, 60000);
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  const formatOrderTime = (timeString) => {
    try {
      return format(new Date(timeString), 'MMMM d, yyyy h:mm a');
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown time";
    }
  };

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
          <h1 className="text-3xl font-bold">Our Community Orders</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <p className="text-gray-600 mb-4">
          See what others in our campus community are ordering. Join the foodie movement!
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 flex items-center">
          <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div className="text-blue-700 text-sm">
            <p className="font-medium">Live updates are enabled!</p>
            <p>This page auto-refreshes in real-time as new orders come in. All orders are automatically removed after 24 hours.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-100 animate-pulse h-24">
                <CardContent className="p-6"></CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col space-y-4 max-h-[70vh] overflow-y-auto p-2">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-900">{order.student_name}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatOrderTime(order.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        ordered from <span className="font-medium">{order.shops?.name || 'Unknown Restaurant'}</span>
                      </p>
                      <div className="flex flex-wrap mt-1">
                        {Array.isArray(order.items) && order.items.map((item, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {order.total_amount && (
                      <div className="ml-4 text-right">
                        <div className="font-medium text-green-600">₹{order.total_amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No orders found yet. Be the first to order!</p>
            <Button asChild>
              <Link to="/student/restaurants">Browse Restaurants</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
