
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  shop_id: string;
  category?: string;
  description?: string;
  is_available?: boolean;
  image_url?: string;
}

interface Shop {
  id: string;
  name: string;
}

const VendorMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Main Course");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const navigate = useNavigate();
  
  // Available food categories
  const categories = [
    "Main Course",
    "Appetizer",
    "Dessert",
    "Drinks",
    "Snacks",
    "Breakfast",
    "Special"
  ];
  
  useEffect(() => {
    // Check authentication and get shop ID
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
        console.log("Authenticated vendor ID:", userId);
        
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
        
        console.log("Found shop:", shopData);
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
          console.log("Loaded menu items:", menuData);
          setMenuItems(menuData || []);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const resetImageForm = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File, itemId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shop?.id}/menu/${itemId}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('shop_images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('shop_images')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload menu item image');
      return null;
    }
  };
  
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
      // Simplify the insertion by not using the category field initially
      // This ensures we don't hit schema cache issues
      const basicMenuItem = {
        shop_id: shop.id,
        name: newItemName.trim(),
        price: price
      };
      
      console.log("Adding basic menu item:", basicMenuItem);
      
      // Insert the basic item first
      const { data: newItem, error } = await supabase
        .from('menu_items')
        .insert([basicMenuItem])
        .select()
        .maybeSingle();
        
      if (error) {
        console.error("Error adding item:", error);
        toast.error(`Failed to add food item: ${error.message}`);
        return;
      }
      
      if (!newItem) {
        toast.error("Failed to create item - no data returned");
        return;
      }
      
      console.log("Successfully added basic menu item:", newItem);
      
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, newItem.id);
      }
      
      // Now update with the additional fields
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({
          category: newItemCategory,
          description: `Delicious ${newItemName.trim()}`,
          is_available: true,
          image_url: imageUrl
        })
        .eq('id', newItem.id);
      
      if (updateError) {
        console.error("Error updating item with category:", updateError);
        // The item is created but without category, continue anyway
      }
      
      // Re-fetch the complete item
      const { data: updatedItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', newItem.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching updated item:", fetchError);
      } else if (updatedItem) {
        console.log("Final menu item with all fields:", updatedItem);
        setMenuItems([...menuItems, updatedItem]);
      } else {
        // Use the basic item if we couldn't fetch the updated one
        setMenuItems([...menuItems, newItem]);
      }
      
      toast.success("Food item added successfully");
      
      // Clear form
      setNewItemName("");
      setNewItemPrice("");
      resetImageForm();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add food item - unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      // Delete from Supabase
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
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove food item");
    }
  };

  const handleAddImage = async (item: MenuItem) => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage(imageFile, item.id);
      if (imageUrl) {
        // Update item with the image URL
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ image_url: imageUrl })
          .eq('id', item.id);
          
        if (updateError) {
          console.error("Error updating item with image:", updateError);
          toast.error("Failed to save image for food item");
          return;
        }
        
        // Update local state
        setMenuItems(menuItems.map(menuItem => 
          menuItem.id === item.id ? { ...menuItem, image_url: imageUrl } : menuItem
        ));
        
        toast.success("Image added successfully");
        setEditingItem(null);
        resetImageForm();
      }
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    } finally {
      setIsSubmitting(false);
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
          <div className="grid gap-4 md:grid-cols-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="food-category">Category</Label>
              <Select 
                value={newItemCategory} 
                onValueChange={setNewItemCategory}
              >
                <SelectTrigger id="food-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="food-image">Image (Optional)</Label>
              <div className="flex items-end gap-2">
                <div 
                  className="flex-1 flex items-center justify-center h-10 border border-input rounded-md bg-background cursor-pointer hover:bg-accent transition-colors"
                  onClick={triggerFileInput}
                >
                  <ImageIcon size={16} className="mr-2" />
                  <span className="text-sm">{imageFile ? 'Change Image' : 'Add Image'}</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="food-image" 
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </div>
                <Button 
                  onClick={handleAddItem} 
                  disabled={isSubmitting}
                  className="bg-vendor-600 hover:bg-vendor-700"
                >
                  <Plus size={16} className="mr-2" /> Add Item
                </Button>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-20 object-cover rounded-md" 
                  />
                </div>
              )}
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
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-md object-cover" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex space-x-4">
                        <p className="text-vendor-700">₹{item.price.toFixed(2)}</p>
                        {item.category && (
                          <span className="text-sm text-gray-500">{item.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            resetImageForm();
                          }}
                          className="text-vendor-700"
                        >
                          {item.image_url ? 'Change Image' : 'Add Image'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{item.image_url ? 'Change Image' : 'Add Image'} for {item.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div 
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={triggerFileInput}
                          >
                            {imagePreview ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="mb-2 max-h-40 object-contain rounded-md" 
                                />
                                <p className="text-sm text-gray-500">Click to change image</p>
                              </div>
                            ) : item.image_url ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name} 
                                  className="mb-2 max-h-40 object-contain rounded-md" 
                                />
                                <p className="text-sm text-gray-500">Click to change image</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">Click to upload image</p>
                                <p className="text-sm text-gray-400 mt-1">Recommended: Square image, 500x500 pixels</p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingItem(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              disabled={!imageFile || isSubmitting}
                              onClick={() => handleAddImage(item)}
                              className="bg-vendor-600 hover:bg-vendor-700"
                            >
                              {isSubmitting ? 'Saving...' : 'Save Image'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
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
