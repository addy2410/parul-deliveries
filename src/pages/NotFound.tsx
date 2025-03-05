
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, RefreshCcw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const isRestaurantPath = location.pathname.includes("/student/restaurant/");
  const isVendorPath = location.pathname.includes("/vendor/");

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        
        {isRestaurantPath ? (
          <div>
            <p className="text-gray-500 mb-6">
              The restaurant you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>
            <p className="text-sm text-amber-600 mb-6">
              Note: If you just registered a new restaurant, you may need to refresh your browser cache 
              or wait a few minutes for the data to be available.
            </p>
            <div className="flex justify-center mb-6">
              <Button onClick={handleRefresh} className="flex items-center">
                <RefreshCcw size={16} className="mr-2" /> Refresh Page
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center">
              <Home size={16} className="mr-2" /> Home
            </Link>
          </Button>
          
          {isRestaurantPath ? (
            <Button asChild>
              <Link to="/student/restaurants" className="flex items-center">
                <Search size={16} className="mr-2" /> Browse Restaurants
              </Link>
            </Button>
          ) : isVendorPath ? (
            <Button asChild>
              <Link to="/vendor/dashboard" className="flex items-center">
                <ArrowLeft size={16} className="mr-2" /> Vendor Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/student/restaurants" className="flex items-center">
                <ArrowLeft size={16} className="mr-2" /> Back to Restaurants
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
