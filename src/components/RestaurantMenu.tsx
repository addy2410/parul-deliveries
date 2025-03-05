
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { menuItems } from "@/data/data";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const { addToCart, cartItems, updateQuantity, totalPrice } = useCart();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Group menu items by category
  const filteredItems = menuItems.filter(
    (item) => item.restaurantId === restaurantId
  );
  
  const categories = [...new Set(filteredItems.map((item) => item.category))];
  
  const getItemQuantityInCart = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddItemClick = (item: any) => {
    addToCart(item);
  };
  
  const handleRemoveItemClick = (itemId: string) => {
    const currentQuantity = getItemQuantityInCart(itemId);
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      // Remove item completely
      updateQuantity(itemId, 0);
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3
            className="text-xl font-semibold cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {category} 
            <span className="text-muted-foreground text-sm ml-2">
              ({filteredItems.filter((item) => item.category === category).length})
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredItems
              .filter((item) => item.category === category)
              .map((item) => {
                const quantityInCart = getItemQuantityInCart(item.id);
                
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="md:flex">
                          <div className="md:w-1/4 h-48 md:h-auto">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4 md:w-3/4 flex flex-col justify-between">
                            <div>
                              <h4 className="font-medium text-lg">{item.name}</h4>
                              <p className="text-muted-foreground text-sm my-2">
                                {item.description}
                              </p>
                              <p className="font-medium">₹{item.price.toFixed(2)}</p>
                            </div>
                            <div className="mt-4 flex justify-end items-center">
                              {quantityInCart > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => handleRemoveItemClick(item.id)}
                                  >
                                    <MinusCircle size={16} />
                                  </Button>
                                  
                                  <span className="font-medium">{quantityInCart}</span>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
                                    onClick={() => handleAddItemClick(item)}
                                  >
                                    <PlusCircle size={16} />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  onClick={() => handleAddItemClick(item)}
                                  className="flex items-center bg-primary rounded-full px-4 hover:bg-primary/90"
                                >
                                  <PlusCircle size={16} className="mr-1" /> Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
      
      {/* Cart summary that shows when items are added */}
      {totalPrice > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10"
        >
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                <p className="font-bold text-lg">₹{totalPrice.toFixed(2)}</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <ShoppingCart size={16} className="mr-2" /> Checkout
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RestaurantMenu;
