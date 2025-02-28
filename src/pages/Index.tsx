
import React from "react";
import HeroSection from "@/components/ui/HeroSection";
import RoleSelection from "@/components/RoleSelection";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection
        title="Campus Grub Connect"
        subtitle="The fastest way to get food delivered on campus"
        imageUrl="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=3280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Choose Your Role</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're a food vendor or a hungry student, our platform connects you 
            for seamless campus food delivery.
          </p>
        </motion.div>
        
        <RoleSelection />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h4 className="font-medium text-lg mb-2">Select a Restaurant</h4>
              <p className="text-gray-600">Browse our selection of campus food vendors and find what you're craving.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h4 className="font-medium text-lg mb-2">Place Your Order</h4>
              <p className="text-gray-600">Choose your items, customize as needed, and pay securely online.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h4 className="font-medium text-lg mb-2">Enjoy Your Delivery</h4>
              <p className="text-gray-600">Track your order in real-time and receive it at your campus location.</p>
            </div>
          </div>
        </motion.div>
        
        <footer className="mt-20 pt-6 border-t text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Campus Grub Connect. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
