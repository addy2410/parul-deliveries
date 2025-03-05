import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { restaurants, menuItems as sampleMenuItems } from "@/data/data";
import FoodCard from "@/components/FoodCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MapPin, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { isUsingDefaultCredentials } from "@/lib/supabase";

const StudentRestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // Fetch restaurant and menu items data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        console.log("Fetching restaurant data for ID:", id);
        
        // If using demo credentials or the ID is from sample data, use sample data
        if (isUsingDefaultCredentials() || id?.startsWith('rest-')) {
          console.info("Using sample data (demo mode)");
          const sampleRestaurant = restaurants.find((r) => r.id === id);
          if (!sampleRestaurant) {
            toast.error("Restaurant not found");
            return;
          }
          
          setRestaurant(sampleRestaurant);
          setMenuItems(sampleMenuItems.filter((item) => item.restaurantId === id));
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from Supabase
        console.info("Fetching real restaurant data from Supabase for ID:", id);
        
        // Fetch restaurant details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (shopError) {
          console.error("Error fetching restaurant:", shopError);
          toast.error("Could not load restaurant details");
          setLoading(false);
          return;
        }
        
        if (!shopData) {
          console.log("No restaurant found with ID:", id);
          setLoading(false);
          return;
        }
        
        console.log("Successfully fetched shop data:", shopData);
        
        // Transform shop data to match Restaurant interface
        const transformedShop = {
          id: shopData.id,
          name: shopData.name,
          description: shopData.description || 'Delicious food awaits!',
          logo: shopData.logo || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
          coverImage: shopData.cover_image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
          location: shopData.location || 'Campus',
          rating: shopData.rating || 4.5,
          cuisine: shopData.cuisine || 'Food',
          tags: shopData.tags || [shopData.cuisine || 'Food'],
          deliveryFee: 30.00,
          deliveryTime: shopData.delivery_time || '30-45 min',
          isOpen: shopData.is_open !== false
        };
        
        setRestaurant(transformedShop);
        console.log("Transformed shop data:", transformedShop);
        
        // Fetch menu items for this restaurant
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('shop_id', id);
          
        if (menuError) {
          console.error("Error fetching menu items:", menuError);
          toast.error("Could not load menu items");
          setLoading(false);
          return;
        }
        
        console.log("Successfully fetched menu items:", menuData);
        
        if (!menuData || menuData.length === 0) {
          console.log("No menu items found for this restaurant");
          setMenuItems([]);
          setLoading(false);
          return;
        }
        
        // Transform menu items data
        const transformedMenuItems = menuData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || `Delicious ${item.name}`,
          price: item.price,
          image: item.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
          restaurantId: item.shop_id,
          category: item.category || 'Main Course',
          isAvailable: item.is_available !== false
        }));
        
        console.log("Transformed menu items:", transformedMenuItems);
        setMenuItems(transformedMenuItems);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRestaurantData();
    }
  }, [id]);
  
  // Extract unique categories
  const categories = Array.from(
    new Set(menuItems.map((item) => item.category))
  );
  
  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;
  
  // Set first category as selected by default
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  
  // Handle adding item to cart with quantity
  const handleAddToCart = (menuItem: any, quantity: number) => {
    // Add the item to cart with the specified quantity
    addToCart(menuItem, quantity);
  };
  
  // Calculate number of items already in cart for this restaurant
  const itemsInCart = items.filter(item => item.restaurantId === id).length;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-8 flex justify-center items-center">
          <p>Loading restaurant details...</p>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto p-8 flex justify-center items-center flex-col gap-4">
          <p className="text-xl">Restaurant not found</p>
          <Button asChild>
            <Link to="/student/restaurants">Go back to restaurants</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="relative h-60 md:h-72 lg:h-80">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <Button variant="outline" size="sm" className="bg-white/90" asChild>
            <Link to="/student/restaurants">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Link>
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-4 left-4 right-4 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            {restaurant.tags.map((tag: string, index: number) => (
              <Badge key={index} className="bg-[#ea384c]/90 hover:bg-[#ea384c] border-none">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-white/90">{restaurant.cuisine} • {restaurant.location}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm">{restaurant.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurant.location}</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="container mx-auto p-4">
        {itemsInCart > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-white p-4 rounded-lg shadow-md border-l-4 border-[#ea384c] flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{itemsInCart} item(s) in your cart</p>
              <p className="text-sm text-gray-500">From {restaurant.name}</p>
            </div>
            <Button asChild size="sm" className="bg-[#ea384c] hover:bg-[#d02e40]">
              <Link to="/student/cart">
                View Cart <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md -mt-6 relative z-10"
        >
          <div className="p-4 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={selectedCategory === category ? "bg-[#ea384c] hover:bg-[#d02e40]" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">
          {selectedCategory ? selectedCategory : "All Items"}
        </h2>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available for this restaurant.</p>
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FoodCard
                  item={food}
                  onAddToCart={(quantity) => handleAddToCart(food, quantity)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRestaurantDetail;
