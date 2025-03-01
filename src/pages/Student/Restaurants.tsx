import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/data/data";
import { sampleRestaurants } from "@/data/data";
import { MapPin, Star } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";

const StudentRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setRestaurants(sampleRestaurants);
    console.info("Using sample data for restaurants (demo mode)");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 mt-4">Campus Restaurants</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="card-hover">
              <Link to={`/student/restaurant/${restaurant.id}`}>
                <div className="relative h-40 overflow-hidden rounded-md">
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    className="object-cover w-full h-full transition-transform duration-300 transform-gpu group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                    <p className="text-sm opacity-80">{restaurant.tags.join(', ')}</p>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {restaurant.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      {restaurant.rating}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentRestaurants;
