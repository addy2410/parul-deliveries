
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Utensils, 
  ShoppingBag, 
  PackageOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut,
  Store 
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Shop {
  id: string;
  name: string;
  location: string;
  description?: string;
  isOpen?: boolean;
}

interface OrderSummary {
  pending: number;
  completed: number;
  cancelled: number;
  totalSales: number;
}

const VendorDashboard = () => {
  const [vendorName, setVendorName] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderSummary>({
    pending: 3,
    completed: 12,
    cancelled: 1,
    totalSales: 2546.00
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVendorAuth = async () => {
      try {
        // Always check Supabase auth
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          toast.error("You need to login first");
          navigate("/vendor/login");
          return;
        }
        
        const userId = data.session.user.id;
        const email = data.session.user.email;
        setVendorName(email?.split('@')[0].replace("-vendor", "") || "Vendor");
        
        // Get vendor's shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('vendor_id', userId)
          .single();
          
        if (shopError) {
          if (shopError.code === 'PGRST116') {
            // No shop found
            navigate("/vendor/register-shop");
            return;
          }
          console.error("Error fetching shop:", shopError);
          toast.error("Failed to load shop data");
          return;
        }
        
        setShop(shopData);
        
        // Get order stats (using demo data for now)
        // TODO: Replace with real Supabase queries when more data is available
        setOrderStats({
          pending: Math.floor(Math.random() * 5) + 1,
          completed: Math.floor(Math.random() * 15) + 5,
          cancelled: Math.floor(Math.random() * 3),
          totalSales: Math.floor(Math.random() * 5000) + 1000
        });
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/vendor/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkVendorAuth();
  }, [navigate]);

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/vendor/login");
  };

  const handleViewOrders = (type: string) => {
    // This would normally navigate to a filtered orders page
    toast.info(`Viewing ${type} orders`);
    
    // For demo, we'll just show a message
    switch(type) {
      case 'pending':
        toast.info(`You have ${orderStats.pending} pending orders to process`);
        break;
      case 'completed':
        toast.info(`You have completed ${orderStats.completed} orders today`);
        break;
      case 'cancelled':
        toast.info(`${orderStats.cancelled} orders were cancelled today`);
        break;
      case 'sales':
        toast.info(`Today's sales total: ₹${orderStats.totalSales.toFixed(2)}`);
        break;
      default:
        toast.info("Order view not implemented yet");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium">{vendorName}</span>
          </p>
        </div>
        <Button variant="outline" className="mt-4 md:mt-0" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>

      {/* Shop Information Card */}
      <Card className="mb-8 border-vendor-200 bg-vendor-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="bg-vendor-100 p-4 rounded-lg">
              <Store size={40} className="text-vendor-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{shop?.name}</h2>
              <p className="text-muted-foreground mb-2">{shop?.location}</p>
              <p>{shop?.description || "No description available"}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="bg-white" 
                onClick={() => navigate("/vendor/menu")}
              >
                <Utensils size={16} className="mr-2" /> Manage Menu
              </Button>
              <Button 
                variant={shop?.isOpen ? "destructive" : "default"}
                className={shop?.isOpen ? "" : "bg-green-600 hover:bg-green-700"}
                onClick={() => {
                  const newStatus = !shop?.isOpen;
                  setShop(prev => prev ? {...prev, isOpen: newStatus} : null);
                  toast.success(`Shop is now ${newStatus ? 'open' : 'closed'}`);
                }}
              >
                {shop?.isOpen ? "Close Shop" : "Open Shop"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-muted-foreground text-sm">Pending Orders</p>
                <h3 className="text-3xl font-bold">{orderStats.pending}</h3>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock size={24} className="text-orange-500" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-sm text-vendor-600 hover:underline p-0"
              onClick={() => handleViewOrders('pending')}
            >
              View pending orders
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-muted-foreground text-sm">Completed Today</p>
                <h3 className="text-3xl font-bold">{orderStats.completed}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-sm text-vendor-600 hover:underline p-0"
              onClick={() => handleViewOrders('completed')}
            >
              View completed orders
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-muted-foreground text-sm">Cancelled Today</p>
                <h3 className="text-3xl font-bold">{orderStats.cancelled}</h3>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle size={24} className="text-red-500" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-sm text-vendor-600 hover:underline p-0"
              onClick={() => handleViewOrders('cancelled')}
            >
              View cancelled orders
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-muted-foreground text-sm">Today's Sales (₹)</p>
                <h3 className="text-3xl font-bold">{orderStats.totalSales.toFixed(2)}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShoppingBag size={24} className="text-blue-500" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-sm text-vendor-600 hover:underline p-0"
              onClick={() => handleViewOrders('sales')}
            >
              View sales report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Manage your incoming and ongoing orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-2" />
            <p>You don't have any recent orders</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => toast.info("All orders functionality coming soon!")}>View All Orders</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VendorDashboard;
