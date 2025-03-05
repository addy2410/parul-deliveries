
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
  CheckCircle2, 
  XCircle, 
  LogOut,
  Store,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorOrdersSection from "@/components/VendorOrdersSection";

interface Shop {
  id: string;
  name: string;
  location: string;
  description?: string;
  is_open?: boolean;
}

const VendorDashboard = () => {
  const [vendorEmail, setVendorEmail] = useState("");
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Stats for demonstration
  const stats = {
    pendingOrders: 3,
    completedToday: 12,
    cancelledToday: 1,
    totalSales: 2546.00
  };

  useEffect(() => {
    const checkVendorAuth = async () => {
      try {
        // Check Supabase auth
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          toast.error("You need to login first");
          navigate("/vendor/login");
          return;
        }
        
        const userId = data.session.user.id;
        const email = data.session.user.email;
        setVendorEmail(email || "Vendor");
        setVendorId(userId);
        
        // Get vendor's shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('vendor_id', userId)
          .maybeSingle();
          
        if (shopError) {
          if (shopError.code === 'PGRST116' || !shopData) {
            // No shop found
            navigate("/vendor/register-shop");
            return;
          }
          console.error("Error fetching shop:", shopError);
          toast.error("Failed to load shop data");
          return;
        }
        
        if (!shopData) {
          navigate("/vendor/register-shop");
          return;
        }
        
        setShop(shopData);
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
  
  const handleShopStatusChange = async (newStatus: boolean) => {
    if (!shop) return;
    
    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_open: newStatus })
        .eq('id', shop.id);
        
      if (error) {
        console.error("Error updating shop status:", error);
        toast.error("Failed to update shop status");
        return;
      }
      
      setShop(prev => prev ? {...prev, is_open: newStatus} : null);
      toast.success(`Shop is now ${newStatus ? 'open' : 'closed'}`);
    } catch (error) {
      console.error("Error updating shop status:", error);
      toast.error("An error occurred while updating shop status");
    }
  };

  const handleDeleteShopAndAccount = async () => {
    if (!shop) return;
    
    try {
      setIsDeleting(true);
      
      // First delete all menu items associated with the shop
      const { error: menuItemsError } = await supabase
        .from('menu_items')
        .delete()
        .eq('shop_id', shop.id);
        
      if (menuItemsError) {
        console.error("Error deleting menu items:", menuItemsError);
        toast.error("Failed to delete menu items");
        return;
      }
      
      // Then delete the shop itself
      const { error: shopError } = await supabase
        .from('shops')
        .delete()
        .eq('id', shop.id);
        
      if (shopError) {
        console.error("Error deleting shop:", shopError);
        toast.error("Failed to delete shop");
        return;
      }
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success("Shop successfully deleted and you've been logged out");
      navigate("/");
    } catch (error) {
      console.error("Error during deletion process:", error);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsDeleting(false);
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
            Welcome back, <span className="font-medium">{vendorEmail}</span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 size={16} className="mr-2" /> Delete Shop & Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your shop, 
                  all menu items, and your vendor account from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteShopAndAccount} 
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete everything"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
                variant={shop?.is_open ? "destructive" : "default"}
                className={shop?.is_open ? "" : "bg-green-600 hover:bg-green-700"}
                onClick={() => handleShopStatusChange(!shop?.is_open)}
              >
                {shop?.is_open ? "Close Shop" : "Open Shop"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Pending Orders</p>
                    <h3 className="text-3xl font-bold">{stats.pendingOrders}</h3>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <ShoppingBag size={24} className="text-yellow-500" />
                  </div>
                </div>
                <Button variant="link" className="text-sm text-vendor-600 p-0 h-auto" onClick={() => setActiveTab('orders')}>
                  View pending orders
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Completed Today</p>
                    <h3 className="text-3xl font-bold">{stats.completedToday}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 size={24} className="text-green-500" />
                  </div>
                </div>
                <Button variant="link" className="text-sm text-vendor-600 p-0 h-auto" onClick={() => setActiveTab('orders')}>
                  View completed orders
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Cancelled Today</p>
                    <h3 className="text-3xl font-bold">{stats.cancelledToday}</h3>
                  </div>
                  <div className="bg-red-100 p-2 rounded-lg">
                    <XCircle size={24} className="text-red-500" />
                  </div>
                </div>
                <Button variant="link" className="text-sm text-vendor-600 p-0 h-auto" onClick={() => setActiveTab('orders')}>
                  View cancelled orders
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Today's Sales (₹)</p>
                    <h3 className="text-3xl font-bold">{stats.totalSales.toFixed(2)}</h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ShoppingBag size={24} className="text-blue-500" />
                  </div>
                </div>
                <Button variant="link" className="text-sm text-vendor-600 p-0 h-auto">
                  View sales report
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Shop Activity</CardTitle>
                <CardDescription>A summary of your shop's recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Track your shop's performance here</p>
                  <p className="mt-2">Use the Orders tab to view and manage customer orders</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveTab('orders')}>Go to Orders</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-0">
          {shop && vendorId && (
            <VendorOrdersSection shopId={shop.id} vendorId={vendorId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
