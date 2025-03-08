
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CircleCheckBig,
  XCircle,
  Menu,
  PanelRight,
  User,
  LogOut,
  ShoppingBag,
  Store,
  Clock,
  AlertTriangle,
  BarChart3,
  Bell,
  Image
} from "lucide-react";
import VendorOrdersList from "@/components/VendorOrdersList";
import VendorNotifications from "@/components/VendorNotifications";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          toast.error("You need to login first");
          navigate("/vendor/login");
          return;
        }
        
        const vendorId = data.session.user.id;
        
        // Check if vendor has a shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("vendor_id", vendorId)
          .maybeSingle();
          
        if (shopError) {
          console.error("Error fetching shop:", shopError);
          toast.error("Error fetching your shop data");
        }
        
        if (!shopData) {
          // No shop found, redirect to shop registration
          navigate("/vendor/register-shop");
          return;
        }
        
        setShop(shopData);
        setIsOpen(shopData.is_open);
        if (shopData.image_url) {
          setPreviewUrl(shopData.image_url);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/vendor/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/vendor/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const handleShopStatusChange = async () => {
    try {
      setIsSubmitting(true);
      const newStatus = !isOpen;
      
      // Update shop status in the database
      const { error } = await supabase
        .from('shops')
        .update({ is_open: newStatus })
        .eq('id', shop.id);
        
      if (error) {
        console.error('Error updating shop status:', error);
        toast.error('Failed to update shop status');
        return;
      }
      
      // Update local state
      setIsOpen(newStatus);
      setShop({...shop, is_open: newStatus});
      toast.success(`Shop is now ${newStatus ? 'open' : 'closed'} for orders`);
    } catch (error) {
      console.error('Error updating shop status:', error);
      toast.error('Failed to update shop status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!shopImage || !shop) return null;
    
    try {
      setIsSubmitting(true);
      const fileExt = shopImage.name.split('.').pop();
      const fileName = `${shop.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('shop_images')
        .upload(fileName, shopImage);
      
      if (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload shop image');
        return null;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('shop_images')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload shop image');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateShopImage = async () => {
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        toast.error('Failed to upload image');
        return;
      }
      
      // Update shop with image URL
      const { error } = await supabase
        .from('shops')
        .update({ image_url: imageUrl })
        .eq('id', shop.id);
        
      if (error) {
        console.error('Error updating shop with image:', error);
        toast.error('Failed to update shop image');
        return;
      }
      
      // Update local state
      setShop({...shop, image_url: imageUrl});
      toast.success('Shop image updated successfully');
      setShowImageDialog(false);
    } catch (error) {
      console.error('Error updating shop image:', error);
      toast.error('Failed to update shop image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store className="text-vendor-600" />
            <h1 className="text-xl font-semibold">Vendor Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5 text-vendor-600" />
              <span className="font-medium">{shop?.name || "Vendor"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {isLoading ? (
        <div className="container mx-auto p-4 flex justify-center items-center h-screen">
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Shop Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Shop Information</span>
                  
                  <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-vendor-600">
                        <Image size={16} className="mr-1" /> Update Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Shop Image</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div 
                          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={triggerFileInput}
                        >
                          {previewUrl ? (
                            <div className="flex flex-col items-center">
                              <img 
                                src={previewUrl} 
                                alt="Shop preview" 
                                className="mb-2 max-h-40 object-contain rounded-md" 
                              />
                              <p className="text-sm text-gray-500">Click to change image</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Image className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-gray-500">Click to upload shop image</p>
                              <p className="text-sm text-gray-400 mt-1">Recommended: 500x300 pixels</p>
                            </div>
                          )}
                          <input
                            type="file"
                            id="shop-image"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowImageDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            disabled={!shopImage || isSubmitting}
                            onClick={updateShopImage}
                            className="bg-vendor-600 hover:bg-vendor-700"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Image'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shop?.image_url && (
                    <div className="w-full h-40 rounded-md overflow-hidden">
                      <img 
                        src={shop.image_url} 
                        alt={shop.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-xl">{shop?.name}</h3>
                    <p className="text-muted-foreground">{shop?.cuisine || "Food Vendor"}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Delivery Time: {shop?.delivery_time || "30-45 min"}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <PanelRight className="h-4 w-4 mr-1" />
                      Location: {shop?.location}
                    </div>
                  </div>
                  
                  {/* Open/Close Toggle */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-medium">Shop Status</span>
                    <div className="flex items-center gap-2">
                      <span className={isOpen ? "text-green-600" : "text-red-600"}>
                        {isOpen ? "Open" : "Closed"}
                      </span>
                      <Switch 
                        checked={isOpen} 
                        onCheckedChange={handleShopStatusChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center pt-2">
                    {isOpen ? (
                      <div className="flex items-center text-green-600">
                        <CircleCheckBig className="h-5 w-5 mr-1" />
                        <span className="font-medium">Open for Orders</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-5 w-5 mr-1" />
                        <span className="font-medium">Closed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild className="w-full bg-vendor-600 hover:bg-vendor-700">
                      <Link to="/vendor/menu">
                        <Menu className="mr-2 h-4 w-4" /> Manage Menu
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          
            {/* Orders and Notifications */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="orders">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="space-y-4">
                  <VendorOrdersList 
                    vendorId={shop?.vendor_id || ''} 
                    shopId={shop?.id} 
                  />
                </TabsContent>
                
                <TabsContent value="notifications">
                  <VendorNotifications vendorId={shop?.vendor_id} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Stats Row */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-1">0</h3>
                    </div>
                    <div className="bg-vendor-100 p-2 rounded-full text-vendor-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                      <h3 className="text-2xl font-bold mt-1">0</h3>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">₹0</h3>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Menu Items</p>
                      <h3 className="text-2xl font-bold mt-1">0</h3>
                    </div>
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <Menu className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
