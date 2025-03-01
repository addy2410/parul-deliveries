
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FoodCardProps {
  item: {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category?: string;
    isAvailable?: boolean;
  };
  onAddToCart: (quantity: number) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const { items } = useCart();
  const isInCart = items.some(cartItem => cartItem.id === item.id);
  
  const handleAddToCart = () => {
    if (item.isAvailable === false) {
      toast.error("This item is currently unavailable");
      return;
    }
    
    onAddToCart(quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`overflow-hidden h-full border border-border/40 ${item.isAvailable === false ? 'opacity-70' : ''}`}>
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {item.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/80 text-black backdrop-blur-sm">
                {item.category}
              </Badge>
            </div>
          )}
          {item.isAvailable === false && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Currently Unavailable
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold truncate mr-2">{item.name}</h3>
            <span className="font-medium whitespace-nowrap">₹{item.price.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
        
        <CardFooter className="pt-0">
          {isInCart ? (
            <Button
              variant="outline" 
              className="w-full border-green-500 text-green-600"
              size="sm"
            >
              <Check size={16} className="mr-1" /> Added to Cart
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </Button>
                <span className="mx-2 text-sm font-medium">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={incrementQuantity}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={item.isAvailable === false}
                variant="default"
                className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Add to Cart
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default FoodCard;
