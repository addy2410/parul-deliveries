
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
    // Create a cart item with all required properties
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId,
      restaurantName,
    });
    toast.success(`Added ${item.name} to cart`);
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center"
                    onClick={() => handleAddToCart(item)}
                  >
                    <PlusCircle size={16} className="mr-1" />
                    Add
                  </Button>
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
