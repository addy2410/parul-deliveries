
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Clock, MapPin, Star, Utensils, PlusCircle } from "lucide-react";
import RestaurantMenu from "@/components/RestaurantMenu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const categories = Array.from(new Set(menuItems.map(item => item.category || 'Other')));
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [menuItems]);

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

  // Group menu items by category
  const groupedItems = menuItems && menuItems.length > 0
    ? menuItems.reduce((acc, item) => {
        const category = item.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, MenuItem[]>)
    : {};

  // Sort categories (with "Other" at the end)
  const categories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const getCategoryBadges = () => {
    if (restaurant.tags && restaurant.tags.length > 0) {
      return restaurant.tags.slice(0, 3).map((tag, idx) => (
        <Badge key={idx} className="bg-red-500 text-white rounded-full">
          {tag}
        </Badge>
      ));
    }
    
    return restaurant.cuisine ? (
      <Badge className="bg-red-500 text-white rounded-full">
        {restaurant.cuisine}
      </Badge>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-white">
      <StudentHeader />
      
      {/* Hero Banner */}
      <div 
        className="h-60 md:h-72 w-full bg-cover bg-center relative" 
        style={{ 
          backgroundImage: `url(${
            restaurant.name === "GREENZY Food Court" 
              ? "/lovable-uploads/6063a852-8cc1-4393-b40f-0703add0cba7.png"
              : restaurant.name === "Main Food Court"
                ? "/lovable-uploads/66a8fbfe-db5c-45b2-a572-42477b6e107e.png"
                : "https://images.unsplash.com/photo-1493770348161-369560ae357d"
          })` 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              {getCategoryBadges()}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-white text-sm">
              <span>{restaurant.cuisine || 'Campus Food'}</span>
              <span>•</span>
              <span>{restaurant.location}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-white">
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-400 fill-yellow-400" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{restaurant.delivery_time}</span>
              </div>
              <div>
                {restaurant.is_open ? (
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    Open Now
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-400 text-red-400">
                    Closed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="whitespace-nowrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`mr-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
        )}

        {/* Menu Items */}
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
          <div className="space-y-8">
            {categories.map((category) => (
              <div 
                key={category} 
                id={`category-${category}`}
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
                        </div>
                        <div className="w-24 h-24 bg-gray-100 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          <button 
                            className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
                          >
                            <PlusCircle size={20} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No menu items available for this restaurant yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
