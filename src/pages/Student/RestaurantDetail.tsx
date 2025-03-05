
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Clock, MapPin, Star } from "lucide-react";
import RestaurantMenu from "@/components/RestaurantMenu";

// Types
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
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
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <p className="text-gray-600 mt-1">{restaurant.description}</p>
              </div>
              {restaurant.is_open ? (
                <Badge className="bg-green-500">Open Now</Badge>
              ) : (
                <Badge variant="outline" className="text-red-500 border-red-500">
                  Closed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {restaurant.location}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {restaurant.delivery_time}
              </div>
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-500" />
                {restaurant.rating} Rating
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {restaurant.cuisine && (
                <Badge variant="secondary">{restaurant.cuisine}</Badge>
              )}
              {restaurant.tags &&
                restaurant.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Menu</h2>
        
        {isLoadingMenu ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : menuError ? (
          <p className="text-red-500">
            Error loading menu items. Please try again later.
          </p>
        ) : (
          <RestaurantMenu 
            menuItems={menuItems || []} 
            restaurantId={restaurant.id} 
            restaurantName={restaurant.name} 
          />
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
