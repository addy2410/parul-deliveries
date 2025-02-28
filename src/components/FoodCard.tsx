
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FoodCardProps {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  index: number;
}

const FoodCard: React.FC<FoodCardProps> = ({
  id,
  restaurantId,
  name,
  description,
  price,
  image,
  category,
  isAvailable,
  index,
}) => {
  const { addItem, items } = useCart();
  const isInCart = items.some(item => item.id === id);
  
  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error("This item is currently unavailable");
      return;
    }
    
    addItem({
      id,
      restaurantId,
      name,
      description,
      price,
      image,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className={`overflow-hidden h-full border border-border/40 ${!isAvailable ? 'opacity-70' : ''}`}>
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/80 text-black backdrop-blur-sm">
              {category}
            </Badge>
          </div>
          {!isAvailable && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Currently Unavailable
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold truncate mr-2">{name}</h3>
            <span className="font-medium whitespace-nowrap">${price.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            variant={isInCart ? "outline" : "default"}
            className={`w-full ${isInCart ? 'border-green-500 text-green-600' : ''}`}
            size="sm"
          >
            {isInCart ? (
              <>
                <Check size={16} className="mr-1" /> Added
              </>
            ) : (
              <>
                <Plus size={16} className="mr-1" /> Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default FoodCard;
