
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Star, Users, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";

const AboutPage = () => {
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-[#ea384c] fontLogo">Campus<span className="text-black">Grub</span></h1>
            <p className="text-lg text-gray-600">
              The premier food delivery service for campus students
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Our Story Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <p className="text-gray-600">
                CampusGrub was founded in 2023 by a group of hungry college students who were frustrated with the lack of convenient food options on campus. We recognized that students often face challenges accessing quality food due to tight schedules, limited transportation, or simply being too busy studying.
              </p>
              <p className="text-gray-600">
                What began as a simple idea has grown into the leading food delivery service specifically designed for university campuses. Our mission is to connect students with the best food options around campus, delivered quickly and reliably.
              </p>
            </section>
            
            {/* Features Section */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Why Choose CampusGrub</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#ea384c] p-3 rounded-full text-white">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Quick Delivery</h3>
                    <p className="text-gray-600">Our network of student delivery partners ensures your food arrives hot and fresh in 30 minutes or less.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-[#ea384c] p-3 rounded-full text-white">
                    <Star size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Top Campus Restaurants</h3>
                    <p className="text-gray-600">We partner with the most loved food vendors and cafeterias across campus.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-[#ea384c] p-3 rounded-full text-white">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">By Students, For Students</h3>
                    <p className="text-gray-600">Our platform is designed specifically for the unique needs and preferences of university students.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-[#ea384c] p-3 rounded-full text-white">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Reliable & Secure</h3>
                    <p className="text-gray-600">Track your order in real-time and pay securely through our platform.</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* How It Works Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-bold">How It Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#ffd1d6] text-[#ea384c] font-bold text-xl rounded-full mb-4">1</div>
                  <h3 className="text-xl font-bold mb-2">Browse Restaurants</h3>
                  <p className="text-gray-600">Explore food options from various campus vendors and restaurants.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#ffd1d6] text-[#ea384c] font-bold text-xl rounded-full mb-4">2</div>
                  <h3 className="text-xl font-bold mb-2">Place Your Order</h3>
                  <p className="text-gray-600">Select your favorite meals and add them to your cart.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#ffd1d6] text-[#ea384c] font-bold text-xl rounded-full mb-4">3</div>
                  <h3 className="text-xl font-bold mb-2">Enjoy Your Food</h3>
                  <p className="text-gray-600">Receive your delivery and enjoy your meal without leaving your dorm or study spot.</p>
                </div>
              </div>
            </section>
            
            {/* Call to Action */}
            <section className="bg-gradient-to-r from-[#ffd1d6] to-[#ffb9b1] p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to order?</h2>
              <p className="text-lg mb-6">Get your favorite campus food delivered in minutes!</p>
              <Button asChild className="bg-[#ea384c] hover:bg-[#d02e40]">
                <Link to="/student/restaurants">Order Now</Link>
              </Button>
            </section>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-2xl font-bold mb-4 fontLogo">Campus<span className="text-[#ea384c]">Grub</span></p>
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} CampusGrub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
