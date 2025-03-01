import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { restaurants, menuItems } from "@/data/data";
import FoodCard from "@/components/FoodCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const StudentRestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, cartItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
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
  
  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="relative h-48 md:h-64 bg-yellow-600">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-3xl font-bold fontLogo">{restaurant.name}</h1>
          <p className="text-white/90">{restaurant.cuisine} • {restaurant.location}</p>
          <div className="flex items-center mt-1">
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
              {restaurant.rating} ★
            </span>
            <span className="ml-2 text-sm">{restaurant.deliveryTime} min delivery time</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md -mt-6 relative z-10">
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
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMenuItems.map((food) => (
            <FoodCard
              key={food.id}
              item={food}
              onAddToCart={(quantity) => handleAddToCart(food, quantity)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentRestaurantDetail;
