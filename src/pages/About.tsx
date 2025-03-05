import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, GraduationCap, Coffee, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  // Add effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen purple-pattern flex flex-col">
      {/* Header with back button */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/student/restaurants">
              <ArrowLeft size={16} className="mr-1" /> Back to Restaurants
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-[#ea384c]">Campus<span className="text-black">Grub</span></h1>
        </div>
      </header>

      {/* Hero Section with fun animated elements */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto relative"
          >
            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 rounded-full opacity-40"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 5
              }}
            />
            <motion.div 
              className="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-200 rounded-full opacity-30"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                delay: 0.5
              }}
            />
            
            <div className="inline-block mb-6 bg-purple-200 p-3 rounded-2xl">
              <GraduationCap className="h-10 w-10 text-purple-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-purple-900">
              About <span className="text-[#ea384c]">Campus<span className="text-black">Grub</span></span>
            </h1>
            <motion.p 
              className="text-xl text-purple-800 mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Made by a Parul University dropout student named Aditya Mishra
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg"
            >
              <Heart className="h-5 w-5" />
              Made with love in Vadodara
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Coffee className="h-8 w-8 text-purple-600" />,
                title: "Coffee Powered",
                description: "This app was fueled by approximately 137 cups of coffee during development."
              },
              {
                icon: <Star className="h-8 w-8 text-purple-600" />,
                title: "Student Favorite",
                description: "Most popular amongst engineering and business students at Parul University."
              },
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                title: "Created For Students",
                description: "Understanding the needs of hungry students was our primary motivation."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-900">{feature.title}</h3>
                <p className="text-purple-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2024 CampusGrub - By Aditya Mishra</p>
          <div className="flex justify-center space-x-4">
            <Link to="/student/restaurants" className="hover:text-purple-300 transition-colors">Home</Link>
            <Link to="/" className="hover:text-purple-300 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
