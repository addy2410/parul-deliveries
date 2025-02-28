
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";
import { motion } from "framer-motion";

// Sample data to use when Supabase is not configured
const sampleRestaurants = [
  {
    id: "1",
    name: "Capitol Cafe",
    description: "A cozy cafe with a variety of snacks and beverages.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Greenzy Salads",
    description: "Fresh salads and healthy options for the health-conscious student.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Main Food Court",
    description: "A variety of options from different cuisines all in one place.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
  }
];

const RestaurantCard = ({ restaurant }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-48 overflow-hidden">
          <img 
            src={restaurant.image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-5">
          <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
          <p className="text-muted-foreground">{restaurant.description}</p>
          <Button className="w-full mt-4" variant="default" asChild>
            <Link to={`/student/restaurant/${restaurant.id}`}>View Menu</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StudentRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      
      // Check if using default credentials
      if (isUsingDefaultCredentials()) {
        console.log("Using sample restaurant data (demo mode)");
        setRestaurants(sampleRestaurants);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');
          
        if (error) {
          console.error("Error fetching restaurants:", error);
          // Fallback to sample data if there's an error
          setRestaurants(sampleRestaurants);
        } else {
          console.log("Fetched restaurants:", data);
          setRestaurants(data.length > 0 ? data : sampleRestaurants);
        }
      } catch (error) {
        console.error("Error:", error);
        setRestaurants(sampleRestaurants);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Campus Restaurants</h1>
      <p className="text-muted-foreground mb-8">
        Browse and order from these campus restaurants.
      </p>
      
      {loading ? (
        <div className="p-12 border rounded-lg flex items-center justify-center">
          <p className="text-center text-muted-foreground">Loading restaurants...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRestaurants;
