
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Utensils, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  // Fix scroll position issue when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
        
        <div className="text-center mb-12">
          <div className="text-3xl font-extrabold text-[#ea384c] fontLogo">
            CampusGrub
          </div>
          <p className="text-gray-600 mt-2">Order food from campus dining venues</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              CampusGrub aims to make campus dining more accessible for students by providing a convenient platform to order food from various dining venues across campus. No more waiting in long lines or rushing between classes to grab a meal!
            </p>
            <p className="text-gray-600">
              We partner with campus dining venues to bring you a seamless ordering experience, reasonable delivery fees, and fast service to ensure you get your food when you need it.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <img 
              src="/lovable-uploads/1a77b2d6-5459-48fa-b819-e131f229d72a.png" 
              alt="Campus food delivery" 
              className="rounded-lg shadow-md max-w-full h-auto"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <Utensils className="w-12 h-12 text-[#ea384c]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Browse & Order</h3>
              <p className="text-gray-600 text-center">
                Browse menus from various campus dining venues and place your order with just a few taps.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <Truck className="w-12 h-12 text-[#ea384c]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Track Delivery</h3>
              <p className="text-gray-600 text-center">
                Track your order in real-time as it's prepared and delivered to your specified campus location.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <Clock className="w-12 h-12 text-[#ea384c]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Enjoy Your Meal</h3>
              <p className="text-gray-600 text-center">
                Receive your food fresh and hot, without having to leave your dorm, library, or classroom.
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose CampusGrub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-[#ea384c] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Campus-Specific</h3>
                <p className="text-gray-600">
                  Unlike other food delivery apps, we focus exclusively on campus dining options, ensuring faster delivery times and more relevant choices.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-[#ea384c] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Time-Saving</h3>
                <p className="text-gray-600">
                  Save valuable time between classes or study sessions by having food delivered directly to you on campus.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Utensils className="w-6 h-6 text-[#ea384c] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">More Choices</h3>
                <p className="text-gray-600">
                  Access menus from dining venues across campus that you might not normally have time to visit.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Truck className="w-6 h-6 text-[#ea384c] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Reliable Delivery</h3>
                <p className="text-gray-600">
                  Our student delivery partners know the campus well and ensure your food arrives promptly.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-gray-600 mb-8">
            Download the app or use our website to start ordering from your favorite campus dining venues today!
          </p>
          <Button className="bg-[#ea384c] hover:bg-[#d02e40]" asChild>
            <Link to="/">Get Started</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
