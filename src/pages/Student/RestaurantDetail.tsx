
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { restaurants, menuItems } from "@/data/data";
import FoodCard from "@/components/FoodCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MapPin, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const StudentRestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Find the restaurant by id
  const restaurant = restaurants.find((r) => r.id === id);
  
  // Filter menu items by restaurant id
  const restaurantMenuItems = menuItems.filter((item) => item.restaurantId === id);
  
  // Extract unique categories
  const categories = Array.from(
    new Set(restaurantMenuItems.map((item) => item.category))
  );
  
  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory
    ? restaurantMenuItems.filter((item) => item.category === selectedCategory)
    : restaurantMenuItems;
  
  // Set first category as selected by default
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  
  // Handle adding item to cart with quantity
  const handleAddToCart = (menuItem: any, quantity: number) => {
    // Add the item to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(menuItem);
    }
  };
  
  // Calculate number of items already in cart for this restaurant
  const itemsInCart = items.filter(item => item.restaurantId === id).length;
  
  if (!restaurant) {
    return <div>Restaurant not found</div>;
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
            {restaurant.tags.map((tag, index) => (
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
        
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRestaurantDetail;
