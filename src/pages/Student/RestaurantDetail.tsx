
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";
import { motion } from "framer-motion";
import { sampleRestaurants, sampleMenuItems } from "@/data/data";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  description?: string;
  image?: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image?: string;
  location?: string;
}

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 bg-student-50">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
              )}
              <p className="text-student-700 font-medium">₹{item.price.toFixed(2)}</p>
            </div>
            <Button className="bg-student-600 hover:bg-student-700" size="sm">
              <ShoppingBag size={14} className="mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StudentRestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      
      if (isUsingDefaultCredentials()) {
        // In demo mode, use sample data
        console.log("Using sample data for restaurant details (demo mode)");
        const foundRestaurant = sampleRestaurants.find(r => r.id === id);
        if (foundRestaurant) {
          setRestaurant({
            id: foundRestaurant.id,
            name: foundRestaurant.name,
            description: foundRestaurant.description,
            image: foundRestaurant.coverImage,
            location: foundRestaurant.location
          });
          
          // For demo, use the menu items from the vendor for the Capitol Food Court
          const menuItemsForRestaurant = JSON.parse(localStorage.getItem('menuItems') || '[]');
          console.log("Retrieved menu items from localStorage:", menuItemsForRestaurant);
          setMenuItems(menuItemsForRestaurant);
        }
        setLoading(false);
        return;
      }
      
      try {
        // In production mode, fetch from Supabase
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurantId', id);
          
        if (menuError) throw menuError;
        
        setRestaurant(restaurantData);
        setMenuItems(menuData || []);
        
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        toast.error("Failed to load restaurant information");
        
        // Fallback to sample data
        const fallbackRestaurant = sampleRestaurants.find(r => r.id === id);
        const fallbackMenuItems = sampleMenuItems.filter(item => item.restaurantId === id);
        
        if (fallbackRestaurant) {
          setRestaurant({
            id: fallbackRestaurant.id,
            name: fallbackRestaurant.name,
            description: fallbackRestaurant.description,
            image: fallbackRestaurant.coverImage,
            location: fallbackRestaurant.location
          });
          setMenuItems(fallbackMenuItems);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);

  // If we don't have a restaurant ID, don't render anything
  if (!id) {
    return <div>No restaurant selected</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/student/restaurants">
          <ArrowLeft size={16} className="mr-2" /> Back to Restaurants
        </Link>
      </Button>
      
      {loading ? (
        <div className="p-12 border rounded-lg flex items-center justify-center">
          <p className="text-center text-muted-foreground">Loading restaurant details...</p>
        </div>
      ) : !restaurant ? (
        <div className="p-12 border rounded-lg flex items-center justify-center">
          <p className="text-center text-muted-foreground">Restaurant not found</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-muted-foreground mb-2">{restaurant.description}</p>
            {restaurant.location && (
              <p className="text-sm bg-student-100 inline-block px-3 py-1 rounded-full">
                {restaurant.location}
              </p>
            )}
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
          
          {menuItems.length === 0 ? (
            <div className="p-12 border rounded-lg flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                No menu items available for this restaurant yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentRestaurantDetail;
