
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { studentId, studentName, isAuthenticated, logout } = useStudentAuth();

  // Fetch restaurants using react-query
  const { isLoading: isRestaurantsLoading, refetch: refetchRestaurants } = useQuery({
    queryKey: ["restaurants", selectedCategory, search],
    queryFn: async () => {
      let query = supabase.from("shops").select("*");

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      setRestaurants(data || []);
    },
    onError: (error) => {
      console.error("Query error fetching restaurants:", error);
    },
    refetchOnMount: false,
  });

  // Fetch categories
  const { isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_categories").select("*");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Extract category names from the data
      const categoryNames = data ? data.map((item) => item.name) : [];
      setCategories(["All", ...categoryNames]);
    },
    onError: (error) => {
      console.error("Query error fetching categories:", error);
    },
    refetchOnMount: false,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Refresh data
  const handleRefresh = useCallback(() => {
    refetchRestaurants();
  }, [refetchRestaurants]);

  useEffect(() => {
    handleRefresh();
  }, [selectedCategory, search, handleRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold fontLogo text-primary">
              CampusGrub
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Input
              type="search"
              placeholder="Search restaurants..."
              className="max-w-md rounded-full pl-10"
              onChange={handleSearch}
            />
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <User className="h-5 w-5" />
                    {studentName && <span className="ml-2 hidden md:inline">{studentName}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/student/orders/active" className="cursor-pointer w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/student/address-book" className="cursor-pointer w-full">
                      Address Book
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/student/login')}>
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Category Filter - Improved horizontal scrolling */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map(category => 
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="rounded-full text-sm py-1 px-4"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isRestaurantsLoading ? (
            // Loading state
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-48">
                <CardContent className="p-6"></CardContent>
              </Card>
            ))
          ) : restaurants.length > 0 ? (
            // Restaurant list
            restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/student/restaurant/${restaurant.id}`}
                className="block"
              >
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Avatar className="mr-4 h-10 w-10">
                        <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                        <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500">{restaurant.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{restaurant.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            // Empty state
            <div className="text-center py-12 col-span-full">
              <h2 className="text-xl font-semibold mb-4">No restaurants found</h2>
              <p className="text-gray-500">
                {search
                  ? "Try adjusting your search or category filter."
                  : "No restaurants available in this category."}
              </p>
              <Button onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }} variant="outline" className="mt-4">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
