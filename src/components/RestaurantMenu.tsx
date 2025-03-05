
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  quantity?: number;
};

type RestaurantMenuProps = {
  menuItems: MenuItem[];
  restaurantId: string;
  restaurantName: string;
};

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({
  menuItems,
  restaurantId,
  restaurantName,
}) => {
  const { addItem } = useCart();
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Sort categories so "Other" appears last
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const handleAddToCart = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    
    // Create a cart item with all required properties
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId,
      restaurantName,
    };
    
    addItem(cartItem, quantity);
    
    toast.success(`Added ${quantity} ${item.name} to cart`);
    
    // Reset quantity after adding to cart
    const updatedQuantities = { ...itemQuantities };
    delete updatedQuantities[item.id];
    setItemQuantities(updatedQuantities);
  };

  const incrementQuantity = (itemId: string) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const decrementQuantity = (itemId: string) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 1) - 1, 1)
    }));
  };

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No menu items available for this restaurant.</p>
      </div>
    );
  }

  // Get a placeholder image based on category
  const getCategoryImage = (category: string) => {
    const images = {
      "Main Course": "https://images.unsplash.com/photo-1585032226651-759b368d7246",
      "Appetizer": "https://images.unsplash.com/photo-1533630654593-b421ef38ba89",
      "Dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b",
      "Drinks": "https://images.unsplash.com/photo-1544145945-f90425340c7e",
      "Snacks": "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      "Breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f10a081a",
      "Special": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
      "South Indian": "https://images.unsplash.com/photo-1630409351217-bc4fa4e1c36c",
      "North Indian": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f",
      "Chinese": "https://images.unsplash.com/photo-1563245372-f21724e3856d",
      "Fast Food": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d"
    };
    
    return images[category as keyof typeof images] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  };

  // Get a food image based on food name
  const getFoodImage = (item: MenuItem) => {
    // Use the item's image if available
    if (item.image) return item.image;
    
    // Some sample food images based on common Indian dishes
    const foodImages: Record<string, string> = {
      "Butter Chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db",
      "Paneer Tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
      "Masala Dosa": "https://images.unsplash.com/photo-1650380881351-e97a730fe63f",
      "Vada Pav": "https://images.unsplash.com/photo-1606491956689-2ea866880c84",
      "Samosa": "https://images.unsplash.com/photo-1631788012442-633271ac4909",
      "Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
      "Curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
      "Naan": "https://images.unsplash.com/photo-1584617769270-a79cbb532dce",
      "Lassi": "https://images.unsplash.com/photo-1626784215021-2e55ae968fba",
      "Chai": "https://images.unsplash.com/photo-1577968897966-3d4325b36b61"
    };
    
    // Check if item name contains any of the keys
    for (const [key, value] of Object.entries(foodImages)) {
      if (item.name.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Default based on category
    return getCategoryImage(item.category || "Other");
  };

  return (
    <div className="mt-6 space-y-6">
      {sortedCategories.map((category) => (
        <div key={category} className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{category}</h3>
            <div className="flex-grow ml-4">
              <Separator className="bg-orange-200" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedItems[category].map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden border border-orange-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-36 overflow-hidden bg-orange-50">
                    <img 
                      src={getFoodImage(item)} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <CardContent className="p-4 flex flex-col justify-between w-full md:w-2/3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-800 border-orange-200">
                        ₹{item.price.toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2 mt-4">
                      {(itemQuantities[item.id] && itemQuantities[item.id] > 0) ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-orange-300"
                            onClick={() => decrementQuantity(item.id)}
                          >
                            <MinusCircle size={16} className="text-orange-600" />
                          </Button>
                          <span className="w-6 text-center font-medium">
                            {itemQuantities[item.id] || 1}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-orange-300"
                            onClick={() => incrementQuantity(item.id)}
                          >
                            <PlusCircle size={16} className="text-orange-600" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center border-orange-300 text-orange-700 hover:bg-orange-50"
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <PlusCircle size={16} className="mr-1 text-orange-600" />
                          Add
                        </Button>
                      )}
                      {(itemQuantities[item.id] && itemQuantities[item.id] > 0) && (
                        <Button
                          size="sm"
                          className="ml-2 bg-[#ea384c] hover:bg-[#d02e40] text-white"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
          
          <Separator className="my-8 bg-gray-100" />
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;
