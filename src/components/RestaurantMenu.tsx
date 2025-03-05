
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Plus } from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Set initial active category
  React.useEffect(() => {
    if (sortedCategories.length > 0 && !activeCategory) {
      setActiveCategory(sortedCategories[0]);
    }
  }, [sortedCategories, activeCategory]);

  const handleAddToCart = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    
    // Create a cart item with all required properties for MenuItem type
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || "",
      image: item.image || "",
      restaurantId: restaurantId
    }, quantity);
    
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
      "Chai": "https://images.unsplash.com/photo-1577968897966-3d4325b36b61",
      "Salad": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "Quinoa": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    };
    
    // Check if item name contains any of the keys
    for (const [key, value] of Object.entries(foodImages)) {
      if (item.name.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Default image
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  };

  return (
    <div className="mt-4">
      {/* Category Navigation */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
        <div className="flex whitespace-nowrap space-x-2">
          {sortedCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div 
            key={category} 
            className={activeCategory === category ? 'block' : 'hidden'}
          >
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groupedItems[category].map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    <div className="flex-grow p-4">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="mt-2 font-medium text-red-500">
                        ₹{item.price.toFixed(2)}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        {(itemQuantities[item.id] && itemQuantities[item.id] > 0) ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border-gray-300"
                              onClick={() => decrementQuantity(item.id)}
                            >
                              <MinusCircle size={16} className="text-gray-600" />
                            </Button>
                            <span className="w-6 text-center font-medium">
                              {itemQuantities[item.id] || 1}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border-gray-300"
                              onClick={() => incrementQuantity(item.id)}
                            >
                              <PlusCircle size={16} className="text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              className="ml-2 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleAddToCart(item)}
                            >
                              Add to Cart
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center border-gray-300 text-gray-700"
                            onClick={() => incrementQuantity(item.id)}
                          >
                            <Plus size={16} className="mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="w-24 h-24 bg-gray-100 relative">
                      <img 
                        src={getFoodImage(item)}
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                      {!itemQuantities[item.id] && (
                        <button 
                          className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <Plus size={20} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
