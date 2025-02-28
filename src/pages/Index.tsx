
import React from "react";
import { motion } from "framer-motion";
import RoleSelection from "@/components/RoleSelection";

const Index = () => {
  return (
    <div className="min-h-screen indian-pattern flex flex-col">
      <header className="py-6 container mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-center text-[#ea384c]"
        >
          Parul In-Campus Delivery
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-2 text-muted-foreground"
        >
          Order food from your favorite campus eateries
        </motion.p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <RoleSelection />
        </motion.div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Parul In-Campus Delivery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
