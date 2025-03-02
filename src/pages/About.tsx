
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-[#F8F7FF] overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-30 pointer-events-none">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3, rotate: 15 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-64 h-64 rounded-full bg-[#9b87f5] filter blur-xl"
        />
      </div>
      <div className="absolute bottom-20 left-10 opacity-30 pointer-events-none">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3, rotate: -10 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-72 h-72 rounded-full bg-[#D6BCFA] filter blur-xl"
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-16">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
            <h1 className="text-5xl md:text-6xl font-bold text-[#7E69AB] mb-6">
              About Campus Grub
            </h1>
            <p className="text-xl text-[#6B5E99] max-w-2xl mx-auto">
              A food delivery solution created by students, for students
            </p>
          </motion.div>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-[#7E69AB] mb-4">
                A Parul University Initiative
              </h2>
              <p className="text-[#6B5E99] text-lg mb-6">
                This is a startup created by Parul University, Vadodara students who recognized 
                the need for a better campus food delivery experience.
              </p>
              <p className="text-[#6B5E99] text-lg">
                Our mission is to connect hungry students with their favorite campus eateries, 
                ensuring delicious food arrives quickly and reliably.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-60"></div>
              <img 
                src="https://images.unsplash.com/photo-1541976844346-f18aeac57b06" 
                alt="Students working together" 
                className="rounded-2xl shadow-lg relative z-10"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-purple-100"
          >
            <h2 className="text-3xl font-bold text-[#7E69AB] mb-6 text-center">
              Our Awesome Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-[#9b87f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#7E69AB] mb-2">Fast Delivery</h3>
                <p className="text-[#6B5E99]">Get your food delivered quickly anywhere on campus</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-[#9b87f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#7E69AB] mb-2">Easy Ordering</h3>
                <p className="text-[#6B5E99]">Simple interface to order from your favorite campus eateries</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-[#9b87f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#7E69AB] mb-2">Special Offers</h3>
                <p className="text-[#6B5E99]">Exclusive discounts and promotions for campus students</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <Button 
              className="bg-[#9b87f5] hover:bg-[#8a74f3] text-white text-lg px-8 py-6"
              onClick={() => navigate("/student/restaurants")}
            >
              Start Ordering Now
            </Button>
          </motion.div>
        </main>
      </div>
      
      <footer className="py-8 text-center text-[#6B5E99] relative z-10">
        <p>© {new Date().getFullYear()} Campus Grub - A Parul University Student Initiative</p>
      </footer>
    </div>
  );
};

export default AboutPage;
