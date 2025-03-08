
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User, Home, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch all orders, regardless of status, to ensure we see orders when students click "Proceed to Payment"
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
          setOrders([]);
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
      }
    };

    fetchOrders();
    
    // Set up a timer to refresh data every minute to see new orders
    const intervalId = setInterval(fetchOrders, 60000);
    
    return () => clearInterval(intervalId);
  }, [toast]);

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
        <h1 className="text-3xl font-bold mb-6">Our Community Orders</h1>
        <p className="text-gray-600 mb-4">
          See what others in our campus community are ordering. Join the foodie movement!
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 flex items-center">
          <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <p className="text-blue-700 text-sm">
            This page automatically refreshes every minute with new orders. Orders older than 24 hours are automatically removed.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-100 animate-pulse h-32">
                <CardContent className="p-6"></CardContent>
              </Card>
            ))}
          </div>
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
                        {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                      <h4 className="text-sm font-medium mb-2">Order Items:</h4>
                      <ul className="text-sm">
                        {order.items && order.items.map((item, index) => (
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
