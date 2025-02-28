
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  restaurantId: string;
}

const VendorMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For demo purposes, we'll use "Capitol Food Court" as the fixed restaurant
  const restaurantId = "rest-1"; // Capitol Food Court ID
  
  useEffect(() => {
    // Load existing menu items
    const loadMenuItems = async () => {
      if (isUsingDefaultCredentials()) {
        // In demo mode, load from localStorage
        const savedItems = localStorage.getItem('menuItems');
        if (savedItems) {
          setMenuItems(JSON.parse(savedItems));
          console.log("Loaded menu items from localStorage", JSON.parse(savedItems));
        } else {
          setMenuItems([]);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurantId', restaurantId);
          
        if (error) {
          console.error("Error loading menu items:", error);
          toast.error("Failed to load menu items");
        } else {
          setMenuItems(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    loadMenuItems();
  }, []);
  
  // Save menu items to localStorage whenever they change (for demo mode)
  useEffect(() => {
    if (isUsingDefaultCredentials() && menuItems.length > 0) {
      localStorage.setItem('menuItems', JSON.stringify(menuItems));
      console.log("Saved menu items to localStorage", menuItems);
    }
  }, [menuItems]);
  
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
    
    setIsSubmitting(true);
    
    // Create new item
    const newItem: MenuItem = {
      id: `item-${Date.now()}`, // Generate a unique ID for demo mode
      name: newItemName.trim(),
      price: price,
      restaurantId: restaurantId,
    };
    
    try {
      if (!isUsingDefaultCredentials()) {
        // In production mode, store in Supabase
        const { error } = await supabase
          .from('menu_items')
          .insert([newItem]);
          
        if (error) throw error;
      }
      
      // Update local state
      setMenuItems([...menuItems, newItem]);
      setNewItemName("");
      setNewItemPrice("");
      toast.success("Food item added successfully");
      
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add food item");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      if (!isUsingDefaultCredentials()) {
        // In production mode, delete from Supabase
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', itemId);
          
        if (error) throw error;
      }
      
      // Update local state
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast.success("Food item removed");
      
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove food item");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/vendor/dashboard">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      <p className="text-muted-foreground mb-8">
        Add and manage food items for Capitol Food Court.
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
