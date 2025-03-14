import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Search, ArrowUpRight, Users, ChevronLeft, ChevronRight } from "lucide-react";
import StudentHeader from "@/components/StudentHeader";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const StudentRestaurants = () => {
  const navigate = useNavigate();
  const [restaurantList, setRestaurantList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Function to get the restaurant cover image based on restaurant name or use uploaded image
  const getRestaurantCoverImage = (restaurant) => {
    // If there's an uploaded image_url, use it
    if (restaurant.image_url) {
      return restaurant.image_url;
    }
    
    // Otherwise, use the default images based on name
    switch(restaurant.name) {
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

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch restaurants data");
        
        // Fetch from Supabase
        const { data: shopsData, error } = await supabase
          .from('shops')
          .select('*');
          
        if (error) {
          console.error("Error fetching restaurants:", error);
          toast.error("Could not load restaurants");
          setRestaurantList([]);
        } else if (shopsData && shopsData.length > 0) {
          console.log("Successfully fetched shops from Supabase:", shopsData);
          
          // Transform the Supabase data to match the Restaurant interface
          const transformedData = shopsData.map(shop => ({
            id: shop.id,
            name: shop.name,
            description: shop.description || '',
            logo: shop.logo || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
            coverImage: shop.image_url || getRestaurantCoverImage({name: shop.name}),
            image_url: shop.image_url,
            location: shop.location,
            rating: shop.rating || 4.5,
            cuisine: shop.cuisine || 'Food',
            tags: shop.tags || [shop.cuisine || 'Food'],
            deliveryFee: 30.00,
            deliveryTime: shop.delivery_time || '30-45 min',
            isOpen: shop.is_open !== false
          }));
          
          console.log("Transformed shop data:", transformedData);
          setRestaurantList(transformedData);
        } else {
          console.log("No shops found in the database");
          setRestaurantList([]);
        }
      } catch (err) {
        console.error("Unexpected error fetching restaurants:", err);
        toast.error("An unexpected error occurred");
        setRestaurantList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on search term and active category
  const filteredRestaurants = restaurantList.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          restaurant.tags.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "All" || restaurant.tags.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const currentRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Change page handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract unique categories from all restaurants
  const categories = ["All", ...Array.from(new Set(restaurantList.flatMap(r => r.tags)))].filter(Boolean);

  // Function to handle Learn More button click
  const handleLearnMoreClick = () => {
    navigate("/about");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed header with proper z-index */}
      <div className="sticky top-0 z-50">
        <StudentHeader />
      </div>
      
      {/* Hero Section with Food Delivery Theme - Fixed position */}
      <div className="relative bg-gradient-to-r from-[#FEC6A1] to-[#FFDEE2] py-16">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hungry? We've Got You Covered</h1>
            <p className="text-lg text-gray-800 mb-6">
              Order delicious food from your favorite campus restaurants. Fast delivery right to your location.
            </p>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for food or restaurant..." 
                className="pl-10 py-6 pr-4 w-full rounded-lg border-gray-200 shadow-md" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Food Elements */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.8,
        x: 50
      }} animate={{
        opacity: 0.8,
        scale: 1,
        x: 0
      }} transition={{
        duration: 0.7,
        delay: 0.3
      }} className="absolute right-5 top-10 hidden md:block">
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" alt="Decorative pizza" className="w-40 h-40 object-cover rounded-full shadow-lg transform rotate-12" />
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 0.7,
        scale: 1
      }} transition={{
        duration: 0.7,
        delay: 0.5
      }} className="absolute right-60 bottom-5 hidden lg:block">
          <img src="https://images.unsplash.com/photo-1585032226651-759b368d7246" alt="Decorative food" className="w-28 h-28 object-cover rounded-full shadow-lg" />
        </motion.div>
      </div>
      
      {/* Category Filter - Horizontally scrollable with proper z-index */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <ScrollArea className="w-full">
          <div className="container mx-auto px-4 py-3">
            <div className="flex space-x-2 min-w-max">
              {categories.map(category => 
                <Button 
                  key={category} 
                  variant={activeCategory === category ? "default" : "outline"} 
                  className={activeCategory === category ? "bg-[#ea384c] hover:bg-[#d02e40]" : ""} 
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      <div className="container mx-auto p-4 flex-1">
        <h2 className="text-2xl font-bold mb-6 mt-4">Campus Restaurants</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="overflow-hidden h-64 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : currentRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRestaurants.map((restaurant, index) => (
              <motion.div 
                key={restaurant.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: index * 0.1 }} 
                whileHover={{ y: -5 }}
              >
                <Card key={restaurant.id} className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 border border-border/40">
                  <Link to={`/student/restaurant/${restaurant.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={restaurant.image_url || getRestaurantCoverImage(restaurant)} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Open Now
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{restaurant.name}</h3>
                        <p className="text-sm opacity-90">{restaurant.tags.join(', ')}</p>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {restaurant.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                          <Star className="h-4 w-4 fill-yellow-500" />
                          {restaurant.rating}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {restaurant.deliveryTime}
                        </div>
                        <Button variant="link" className="text-[#ea384c] p-0 flex items-center">
                          View Menu <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No restaurants found matching your search.</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredRestaurants.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-8 mb-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? "bg-[#ea384c] hover:bg-[#d02e40]" : ""}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Food Delivery Visual Section */}
        <div className="mt-12 mb-8 bg-gradient-to-r from-[#D3E4FD] to-[#E5DEFF] rounded-2xl overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row items-center bg-orange-100">
            <div className="p-8 md:w-1/2">
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }}>
                <h2 className="text-2xl font-bold mb-4">Fast Campus Delivery</h2>
                <p className="mb-6 text-gray-700">
                  We ensure your food arrives hot and fresh, no matter where you are on campus. Track your order in real-time!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#ea384c] hover:bg-[#d02e40]" onClick={scrollToTop}>
                    Order Now
                  </Button>
                  <Button variant="outline" onClick={handleLearnMoreClick}>
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} className="p-4">
                <img 
                  alt="Food Delivery on Mobile" 
                  src="/lovable-uploads/dc6cd078-3194-4336-a771-bbe09a3db8de.jpg" 
                  className="rounded-lg shadow-lg w-full h-64 object-contain" 
                />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Community Button - Added below the Learn More button */}
        <div className="text-center mb-8">
          <Button 
            variant="outline" 
            className="border-dashed border-gray-300 flex items-center mx-auto"
            onClick={() => navigate('/community')}
          >
            <Users className="h-4 w-4 mr-2" />
            Our Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentRestaurants;
