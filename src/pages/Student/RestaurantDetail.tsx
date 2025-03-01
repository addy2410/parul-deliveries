
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FoodCard from "@/components/FoodCard";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { sampleRestaurants, sampleMenuItems, MenuItem } from "@/data/data";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";

const StudentRestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { addToCart, cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Get restaurant data
    const foundRestaurant = sampleRestaurants.find(r => r.id === id);
    setRestaurant(foundRestaurant);

    // Get menu items
    const foundMenuItems = sampleMenuItems.filter(item => item.restaurantId === id);
    
    // Load custom menu items from localStorage
    const storedMenuItems = localStorage.getItem('menuItems');
    let customMenuItems: MenuItem[] = [];
    
    if (storedMenuItems) {
      try {
        const parsedItems = JSON.parse(storedMenuItems);
        
        // Filter items that belong to this restaurant and ensure they have all required fields
        customMenuItems = parsedItems
          .filter((item: any) => item.restaurantId === id)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || "A delicious menu item",
            price: item.price,
            image: item.image || "/placeholder.svg",
            restaurantId: item.restaurantId
          }));
        
        console.info("Retrieved menu items from localStorage:", customMenuItems);
      } catch (error) {
        console.error("Error parsing menu items from localStorage:", error);
      }
    }
    
    setMenuItems([...foundMenuItems, ...customMenuItems]);
    
    console.info("Using sample data for restaurant details (demo mode)");
  }, [id]);

  const handleAddToCart = (menuItem: MenuItem, quantity: number) => {
    addToCart({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity,
      restaurantId: menuItem.restaurantId,
      restaurantName: restaurant?.name || ""
    });
    toast.success(`${quantity}x ${menuItem.name} added to cart`);
  };

  if (!restaurant) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/restaurants" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Restaurants
            </Link>
          </Button>
          
          <Button size="sm" asChild className="bg-student-600 hover:bg-student-700">
            <Link to="/student/cart" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              Cart ({cartItemCount})
            </Link>
          </Button>
        </div>
        
        <div className="relative h-40 md:h-60 rounded-lg overflow-hidden mb-6">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-sm md:text-base opacity-90">{restaurant.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {restaurant.deliveryTime}
              </span>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                ₹{restaurant.deliveryFee.toFixed(2)} delivery
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.length > 0 ? (
            menuItems.map((menuItem) => (
              <FoodCard
                key={menuItem.id}
                food={menuItem}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No menu items available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRestaurantDetail;
