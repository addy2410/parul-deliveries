
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils, TruckFast, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import StudentHeader from "@/components/StudentHeader";
import CampusGrubLogo from "@/components/CampusGrubLogo";

const About = () => {
  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back
          </Link>
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <CampusGrubLogo size="lg" className="mx-auto" />
            <p className="text-gray-600 mt-4 text-lg">
              Bringing your favorite campus foods straight to you
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            {/* Our Story Section */}
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                CampusGrub was founded by a group of university students who were tired of limited food options and long wait times at campus eateries. We believe that busy students deserve convenient access to delicious food without sacrificing their valuable study time.
              </p>
              <p className="text-gray-700 leading-relaxed">
                What started as a small delivery service between classes has grown into a full-fledged platform connecting students with all the best food options across campus. Our mission is to make campus dining more accessible, efficient, and enjoyable for everyone.
              </p>
            </section>
            
            {/* How It Works Section */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-md p-6 text-center"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Choose Your Food</h3>
                  <p className="text-gray-600">
                    Browse through various campus eateries and select your favorite meals
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-md p-6 text-center"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Place Your Order</h3>
                  <p className="text-gray-600">
                    Securely pay online and receive immediate order confirmation
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-md p-6 text-center"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TruckFast className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
                  <p className="text-gray-600">
                    Track your order in real-time as it's delivered to your campus location
                  </p>
                </motion.div>
              </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold mb-8 text-center">What Students Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-lg relative"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        RK
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">Rahul Kumar</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "CampusGrub has been a lifesaver during exam season! I can study without interruption and have food delivered right to the library."
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-lg relative"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                        PJ
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">Priya Joshi</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "I love being able to order from different food courts without having to walk across campus. The app is super easy to use!"
                  </p>
                </motion.div>
              </div>
            </section>
            
            {/* Join Us Section */}
            <section className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Try CampusGrub?</h2>
              <p className="text-gray-600 mb-6">
                Enjoy the convenience of campus food delivery today
              </p>
              <div className="flex justify-center gap-4">
                <Button className="bg-[#ea384c] hover:bg-[#d02e40]" asChild>
                  <Link to="/student/restaurants">Order Now</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/vendor/login">Partner With Us</Link>
                </Button>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
