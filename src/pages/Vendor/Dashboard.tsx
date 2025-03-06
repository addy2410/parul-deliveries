
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Plus, Package, Settings, Edit, Store } from "lucide-react";
import VendorOrdersList from "@/components/VendorOrdersList";
import ShopRegistration from "@/components/Vendor/ShopRegistration";
import ShopEditForm from "@/components/Vendor/ShopEditForm";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const VendorDashboard = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterShop, setShowRegisterShop] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedShop, setSelectedShop] = useState(null);
  const [showEditShop, setShowEditShop] = useState(false);
  const [editShopData, setEditShopData] = useState({ id: "", name: "", location: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem("vendorSession");
        
        if (!session) {
          navigate("/vendor/login");
          return;
        }
        
        const parsedSession = JSON.parse(session);
        if (!parsedSession || !parsedSession.userId) {
          navigate("/vendor/login");
          return;
        }
        
        setVendorId(parsedSession.userId);
        fetchVendorShops(parsedSession.userId);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/vendor/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchVendorShops = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("vendor_id", id);
        
      if (error) {
        throw error;
      }
      
      setShops(data || []);
      if (data && data.length > 0) {
        setSelectedShop(data[0]);
      } else {
        setShowRegisterShop(true);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your shops. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopRegistered = () => {
    setShowRegisterShop(false);
    if (vendorId) {
      fetchVendorShops(vendorId);
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
  };

  const handleEditShop = (shop) => {
    setEditShopData({
      id: shop.id,
      name: shop.name,
      location: shop.location
    });
    setShowEditShop(true);
  };

  const handleEditComplete = () => {
    setShowEditShop(false);
    if (vendorId) {
      fetchVendorShops(vendorId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vendor-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendor-700 mx-auto"></div>
          <p className="mt-4 text-vendor-800">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vendor-50 pb-10">
      <div className="bg-vendor-700 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem("vendorSession");
                navigate("/vendor/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showRegisterShop ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Register Your Shop</h2>
            <ShopRegistration vendorId={vendorId} onComplete={handleShopRegistered} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Shops</h2>
              {shops.length > 0 && (
                <Button onClick={() => setShowRegisterShop(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Shop
                </Button>
              )}
            </div>

            {shops.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Shops</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {shops.map((shop) => (
                          <div 
                            key={shop.id} 
                            className={`p-4 cursor-pointer flex justify-between items-center ${
                              selectedShop && selectedShop.id === shop.id 
                                ? "bg-vendor-100" 
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleShopSelect(shop)}
                          >
                            <div>
                              <div className="font-medium">{shop.name}</div>
                              <div className="text-sm text-muted-foreground">{shop.location}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditShop(shop);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3">
                  {selectedShop && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>
                            {selectedShop.name} 
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              at {selectedShop.location}
                            </span>
                          </CardTitle>
                          <Dialog open={showEditShop} onOpenChange={setShowEditShop}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditShop(selectedShop)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Shop
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogTitle>Edit Shop Details</DialogTitle>
                              <ShopEditForm 
                                shopId={editShopData.id} 
                                initialData={{
                                  name: editShopData.name,
                                  location: editShopData.location
                                }} 
                                onComplete={handleEditComplete} 
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="orders">
                              <Package className="h-4 w-4 mr-2" />
                              Orders
                            </TabsTrigger>
                            <TabsTrigger value="menu">
                              <Store className="h-4 w-4 mr-2" />
                              Menu Management
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="orders" className="mt-0">
                            <VendorOrdersList shopId={selectedShop.id} />
                          </TabsContent>
                          
                          <TabsContent value="menu" className="mt-0">
                            <div className="text-center py-4">
                              <Button onClick={() => navigate(`/vendor/menu-management/${selectedShop.id}`)}>
                                Manage Menu Items
                              </Button>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="settings" className="mt-0">
                            <Card>
                              <CardContent className="pt-6">
                                <h3 className="text-lg font-medium mb-4">Shop Settings</h3>
                                <Button onClick={() => handleEditShop(selectedShop)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Shop Details
                                </Button>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4 text-5xl">🏪</div>
                <h3 className="text-xl font-semibold mb-2">No shops yet</h3>
                <p className="text-muted-foreground mb-4">Register your first shop to start selling on CampusGrub</p>
                <Button onClick={() => setShowRegisterShop(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Register a Shop
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
