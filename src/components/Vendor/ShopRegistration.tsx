
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Store, MapPin, Tags } from "lucide-react";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

interface ShopData {
  name: string;
  description: string;
  location: string;
  cuisine: string;
  tags: string;
}

interface ShopRegistrationProps {
  vendorId: string;
  onComplete: () => void;
}

const ShopRegistration = ({ vendorId, onComplete }: ShopRegistrationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ShopData>({
    name: "",
    description: "",
    location: "",
    cuisine: "",
    tags: ""
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.location) {
      toast.error("Shop name and location are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create shop data object
      const shopData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        cuisine: formData.cuisine,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        vendor_id: vendorId,
        logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", // Default logo
        coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", // Default cover
        rating: 4.5, // Default rating
        deliveryFee: 30.00, // Default fee
        deliveryTime: "15-20 min", // Default time
        isOpen: true // Default status
      };
      
      if (isUsingDefaultCredentials()) {
        // In demo mode, store in localStorage
        const existingShops = JSON.parse(localStorage.getItem('shops') || '[]');
        const newShop = {
          id: `shop-${Date.now()}`,
          ...shopData
        };
        
        localStorage.setItem('shops', JSON.stringify([...existingShops, newShop]));
        localStorage.setItem('currentVendorShop', JSON.stringify(newShop));
        
        toast.success("Shop registered successfully!");
        onComplete();
      } else {
        // In production mode with Supabase
        const { data, error } = await supabase
          .from('shops')
          .insert([shopData])
          .select();
          
        if (error) throw error;
        
        toast.success("Shop registered successfully!");
        onComplete();
      }
    } catch (error) {
      console.error("Error registering shop:", error);
      toast.error("Failed to register shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-vendor-100 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Register Your Shop</CardTitle>
          <CardDescription className="text-center">
            Enter your shop details to start managing your menu and orders
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your shop name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  name="location"
                  placeholder="Building name, floor, etc."
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your shop and what you offer"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  name="cuisine"
                  placeholder="e.g., Indian, Chinese, etc."
                  value={formData.cuisine}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="relative">
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="e.g., Fast Food, Veg, Non-Veg"
                    value={formData.tags}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-vendor-600 hover:bg-vendor-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ShopRegistration;
