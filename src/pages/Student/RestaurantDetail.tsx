
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Clock, MapPin, Star, Utensils } from "lucide-react";
import RestaurantMenu from "@/components/RestaurantMenu";

// Types
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
};

type Restaurant = {
  id: string;
  name: string;
  description: string;
  location: string;
  cuisine: string;
  delivery_time: string;
  rating: number;
  is_open: boolean;
  tags: string[];
};

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Function to get the cover image based on restaurant name
  const getRestaurantCoverImage = (name: string) => {
    switch(name) {
      case "GREENZY Food Court":
        return "/lovable-uploads/e3228c0f-3685-4b2d-ac13-b7c97ad2bf95.png";
      case "Main Food Court":
        return "/lovable-uploads/a8945afc-0ae4-4a10-afce-cf42bf3a646b.png";
      case "BlueZ Biryani":
        return "/lovable-uploads/aa5d95d7-7ead-42b3-89c2-f57ff25788fd.png";
      default:
        return "https://images.unsplash.com/photo-1493770348161-369560ae357d";
    }
  };

  // Fetch restaurant details
  const {
    data: restaurantData,
    isLoading: isLoadingRestaurant,
    error: restaurantError,
  } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Restaurant;
    },
  });

  // Fetch menu items for the restaurant
  const {
    data: menuItems,
    isLoading: isLoadingMenu,
    error: menuError,
  } = useQuery({
    queryKey: ["menuItems", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("shop_id", id);

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (restaurantData) {
      setRestaurant(restaurantData);
    }
  }, [restaurantData]);

  if (isLoadingRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <p className="text-gray-600 mb-6">
            The restaurant you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/student/restaurants")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Go Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <StudentHeader />
      
      {/* Hero Banner */}
      <div 
        className="h-48 md:h-64 w-full bg-cover bg-center relative" 
        style={{ 
          backgroundImage: `url(${getRestaurantCoverImage(restaurant.name)})` 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
              {restaurant.name}
            </h1>
            <p className="text-white text-opacity-90 mt-2 max-w-2xl drop-shadow-md">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-orange-100 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center bg-orange-50 px-3 py-2 rounded-full">
                <MapPin size={16} className="mr-1 text-orange-600" />
                {restaurant.location}
              </div>
              <div className="flex items-center bg-orange-50 px-3 py-2 rounded-full">
                <Clock size={16} className="mr-1 text-orange-600" />
                {restaurant.delivery_time}
              </div>
              <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                <Star size={16} className="mr-1 text-yellow-500 fill-yellow-500" />
                {restaurant.rating} Rating
              </div>
              {restaurant.is_open ? (
                <Badge className="bg-green-500 px-3 py-2 rounded-full">Open Now</Badge>
              ) : (
                <Badge variant="outline" className="text-red-500 border-red-500 px-3 py-2 rounded-full">
                  Closed
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {restaurant.cuisine && (
                <Badge variant="secondary" className="bg-[#FEC6A1] text-orange-900 hover:bg-[#FEC6A1]/80">
                  <Utensils size={14} className="mr-1" />
                  {restaurant.cuisine}
                </Badge>
              )}
              {restaurant.tags &&
                restaurant.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-orange-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xl font-bold text-orange-800">Menu</span>
          </div>
        </div>
        
        {isLoadingMenu ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : menuError ? (
          <p className="text-red-500 text-center py-8">
            Error loading menu items. Please try again later.
          </p>
        ) : menuItems && menuItems.length > 0 ? (
          <RestaurantMenu 
            menuItems={menuItems || []} 
            restaurantId={restaurant.id} 
            restaurantName={restaurant.name} 
          />
        ) : (
          <div className="text-center py-10 bg-orange-50 rounded-lg border border-orange-100">
            <Utensils size={48} className="mx-auto text-orange-300 mb-4" />
            <p className="text-gray-600">No menu items available for this restaurant yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
