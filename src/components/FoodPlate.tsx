
import React from "react";
import { motion } from "framer-motion";

export const FoodPlate = () => {
  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24">
      {/* Plate background with mandala pattern */}
      <motion.div 
        className="absolute inset-0 bg-white rounded-full border-2 border-orange-200"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Cpath d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 5c-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm0 5c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
      
      {/* Thali plate design with food items */}
      <motion.div className="absolute inset-1 rounded-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          {/* Center circle - rice with a jasmine pattern */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full border border-amber-100"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.6'%3E%3Cpath d='M10 0l2.5 5H15l-4 3 2 5-5-3-5 3 2-5-4-3h6.5'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          ></motion.div>
          
          {/* Food items around - South Indian, Rajasthani, and Gujarati dishes */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * (360 / 6)) * (Math.PI / 180);
            const radius = 7; // Distance from center
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            // Regional food colors - brighter, more vibrant colors
            const colors = [
              "bg-yellow-500", // Dal Baati (Rajasthan)
              "bg-green-600", // Palak Paneer (North India)
              "bg-orange-600", // Dhokla (Gujarat)
              "bg-red-500", // Chutney (South India)
              "bg-amber-800", // Bajra Roti (Rajasthan)
              "bg-pink-400", // Jalebi (Gujarat)
            ];
            
            // Add some variance in size
            const sizes = ["w-3 h-3", "w-4 h-3", "w-3 h-4", "w-4 h-4", "w-3.5 h-3", "w-3 h-3.5"];
            
            return (
              <motion.div
                key={i}
                className={`absolute top-1/2 left-1/2 ${sizes[i]} md:w-4 md:h-4 rounded-full ${colors[i]}`}
                style={{
                  transform: `translate(-50%, -50%) translate(${x}em, ${y}em)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}
              />
            );
          })}
        </div>
      </motion.div>
      
      {/* CampusGrub text overlay with stronger contrast */}
      <motion.div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-[#ea384c] fontLogo whitespace-nowrap"
        style={{ textShadow: "0px 0px 1px white" }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        CampusGrub
      </motion.div>
    </div>
  );
};
