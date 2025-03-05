
import React from "react";
import { motion } from "framer-motion";
import RoleSelection from "@/components/RoleSelection";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#FFEDE6] bg-grid-pattern flex flex-col relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
        <motion.img 
          src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af" 
          alt="Decorative spices" 
          className="w-64 h-64 object-cover rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 15 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none">
        <motion.img 
          src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc" 
          alt="Decorative food" 
          className="w-72 h-72 object-cover rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1, rotate: -10 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>

      <header className="py-8 container mx-auto relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-semibold text-center text-[#ea384c] px-2"
        >
          Parul In-Campus Delivery
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-2 text-muted-foreground text-lg"
        >
          Order food from your favorite campus eateries
        </motion.p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <RoleSelection />
        </motion.div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground relative z-10">
        <p>© {new Date().getFullYear()} Parul In-Campus Delivery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
