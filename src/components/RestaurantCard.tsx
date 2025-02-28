
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  deliveryTime: string;
  isOpen: boolean;
  delay?: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  location,
  rating,
  deliveryTime,
  isOpen,
  delay = 0,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-border/40"
        onClick={() => navigate(`/student/restaurant/${id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={isOpen ? "default" : "secondary"} className={isOpen ? "bg-green-500" : "bg-gray-400"}>
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="pt-4">
          <h3 className="text-xl font-semibold mb-2 truncate">{name}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin size={16} className="mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between text-sm">
          <div className="flex items-center">
            <Star size={16} className="mr-1 text-yellow-500 fill-yellow-500" />
            <span>{rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{deliveryTime}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RestaurantCard;
