
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShoppingBag, LogOut, Search, Package, ChefHat, Truck, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  restaurant_name?: string;
}

const AdminAllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Check if user is admin
        const { data: userData, error } = await supabase
          .from('vendors')
          .select('email')
          .eq('id', data.session.user.id)
          .single();
          
        if (!error && userData && userData.email === 'admin@campusgrub.com') {
          setIsAuthenticated(true);
        } else {
          toast.error("Not authorized to view this page");
        }
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchRestaurants();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('all-orders-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          console.log("Realtime order update:", payload);
          fetchOrders(); // Refetch all orders on any change
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
        return;
      }
      
      // Get all unique restaurant IDs
      const restaurantIds = [...new Set(ordersData.map(order => order.restaurant_id))];
      
      // Fetch restaurant names
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name')
        .in('id', restaurantIds);
        
      if (shopsError) {
        console.error("Error fetching shops:", shopsError);
      }
      
      // Create a map of restaurant IDs to names
      const restaurantNames = shopsData?.reduce((acc, shop) => {
        acc[shop.id] = shop.name;
        return acc;
      }, {} as Record<string, string>) || {};
      
      // Add restaurant names to orders
      const ordersWithRestaurantNames = ordersData.map(order => ({
        ...order,
        restaurant_name: restaurantNames[order.restaurant_id] || 'Unknown Restaurant'
      }));
      
      setOrders(ordersWithRestaurantNames);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An error occurred while loading orders");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name');
        
      if (error) {
        console.error("Error fetching restaurants:", error);
        return;
      }
      
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    setIsAuthenticated(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
      case 'preparing': return <ChefHat className="h-5 w-5 text-blue-500" />;
      case 'ready': return <Package className="h-5 w-5 text-purple-500" />;
      case 'delivering': return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter orders based on search, status, and restaurant
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesRestaurant = restaurantFilter === 'all' || order.restaurant_id === restaurantFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && ['pending', 'preparing', 'ready', 'delivering'].includes(order.status)) ||
      (activeTab === 'completed' && order.status === 'delivered') ||
      (activeTab === 'cancelled' && order.status === 'cancelled');
    
    return matchesSearch && matchesStatus && matchesRestaurant && matchesTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold">CampusGrub Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer or restaurant"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivering">Delivering</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {restaurants.map(restaurant => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <Card key={order.id} className="border border-border/40">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium flex items-center">
                                Order #{order.id.slice(0, 8)}...
                                <Badge className="ml-2">{order.restaurant_name}</Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-sm">
                              <strong>Customer:</strong> {order.student_name}
                            </p>
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
                                  <span>{item.quantity}x {item.name}</span>
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAllOrders;
