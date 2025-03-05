
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
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId,
      restaurantName,
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

  return (
    <div className="mt-6 space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedItems[category].map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="outline" className="mt-1">
                      ₹{item.price.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(itemQuantities[item.id] && itemQuantities[item.id] > 0) ? (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => decrementQuantity(item.id)}
                        >
                          <MinusCircle size={16} />
                        </Button>
                        <span className="w-6 text-center">
                          {itemQuantities[item.id] || 1}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <PlusCircle size={16} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center"
                        onClick={() => incrementQuantity(item.id)}
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </Button>
                    )}
                    {(itemQuantities[item.id] && itemQuantities[item.id] > 0) && (
                      <Button
                        size="sm"
                        className="ml-2 bg-primary hover:bg-primary/90"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-6" />
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;
