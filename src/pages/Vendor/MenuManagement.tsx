
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  shop_id: string;
}

interface Shop {
  id: string;
  name: string;
}

const VendorMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication and get shop ID
    const checkVendorAuth = async () => {
      try {
        if (isUsingDefaultCredentials()) {
          // In demo mode, check localStorage
          const vendorId = localStorage.getItem('currentVendorId');
          if (!vendorId) {
            toast.error("You need to login first");
            navigate("/vendor/login");
            return;
          }
          
          // Get vendor's shop
          const shopStr = localStorage.getItem('currentVendorShop');
          if (!shopStr) {
            navigate("/vendor/register-shop");
            return;
          }
          
          const shopData = JSON.parse(shopStr);
          setShop(shopData);
          
          // Load menu items for this shop
          const savedItems = JSON.parse(localStorage.getItem(`menuItems-${shopData.id}`) || '[]');
          setMenuItems(savedItems);
        } else {
          // In production, check Supabase auth
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            toast.error("You need to login first");
            navigate("/vendor/login");
            return;
          }
          
          const userId = data.session.user.id;
          
          // Get vendor's shop
          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('id, name')
            .eq('vendor_id', userId)
            .maybeSingle();
            
          if (shopError) {
            console.error("Error fetching shop:", shopError);
            toast.error("Failed to load shop data");
            return;
          }
          
          if (!shopData) {
            navigate("/vendor/register-shop");
            return;
          }
          
          setShop(shopData);
          
          // Load menu items for this shop
          const { data: menuData, error: menuError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('shop_id', shopData.id);
            
          if (menuError) {
            console.error("Error loading menu items:", menuError);
            toast.error("Failed to load menu items");
          } else {
            setMenuItems(menuData || []);
          }
        }
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
  
  // Save menu items to localStorage whenever they change (for demo mode)
  useEffect(() => {
    if (isUsingDefaultCredentials() && shop && menuItems.length >= 0) {
      localStorage.setItem(`menuItems-${shop.id}`, JSON.stringify(menuItems));
    }
  }, [menuItems, shop]);
  
  const handleAddItem = async () => {
    // Validate inputs
    if (!newItemName.trim()) {
      toast.error("Please enter a food item name");
      return;
    }
    
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    if (!shop) {
      toast.error("Shop information not found");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, just update state
        const newItem = {
          id: `item-${Date.now()}`,
          name: newItemName.trim(),
          price: price,
          shop_id: shop.id,
        };
        
        setMenuItems([...menuItems, newItem]);
        toast.success("Food item added successfully");
      } else {
        // In production mode, store in Supabase
        const { data: newItem, error } = await supabase
          .from('menu_items')
          .insert([{
            shop_id: shop.id,
            name: newItemName.trim(),
            price: price,
          }])
          .select()
          .single();
          
        if (error) {
          console.error("Error adding item:", error);
          toast.error("Failed to add food item");
          return;
        }
        
        setMenuItems([...menuItems, newItem]);
        toast.success("Food item added successfully");
      }
      
      // Clear form
      setNewItemName("");
      setNewItemPrice("");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add food item");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, just update state
        setMenuItems(menuItems.filter(item => item.id !== itemId));
        toast.success("Food item removed");
      } else {
        // In production mode, delete from Supabase
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', itemId);
          
        if (error) {
          console.error("Error removing item:", error);
          toast.error("Failed to remove food item");
          return;
        }
        
        setMenuItems(menuItems.filter(item => item.id !== itemId));
        toast.success("Food item removed");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove food item");
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
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/vendor/dashboard">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      <p className="text-muted-foreground mb-8">
        Add and manage food items for {shop?.name || "your shop"}.
      </p>
      
      <Card className="mb-8 border-vendor-200">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="food-name">Food Item Name</Label>
              <Input 
                id="food-name" 
                placeholder="e.g., Vada Pav, Samosa" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food-price">Price (₹)</Label>
              <Input 
                id="food-price" 
                placeholder="e.g., 45" 
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                type="number"
                min="0"
                step="1"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddItem} 
                disabled={isSubmitting}
                className="bg-vendor-600 hover:bg-vendor-700 w-full"
              >
                <Plus size={16} className="mr-2" /> Add Food Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Current Menu Items</h2>
      
      {menuItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No menu items added yet. Start adding items above.
        </p>
      ) : (
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-vendor-50">
                <CardContent className="py-4 px-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-vendor-700">₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={16} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorMenuManagement;
