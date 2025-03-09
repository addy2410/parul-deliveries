
import React from "react";
import { motion } from "framer-motion";

export const FoodPlate = () => {
  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24">
      {/* Plate background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full border-2 border-orange-200"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
      
      {/* Thali plate design with food items */}
      <motion.div className="absolute inset-1 rounded-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          {/* Center circle - rice */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full border border-amber-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          ></motion.div>
          
          {/* Food items around */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * (360 / 6)) * (Math.PI / 180);
            const radius = 7; // Distance from center
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            // Alternate between different dish colors
            const colors = [
              "bg-yellow-400", // Dal
              "bg-green-500", // Palak
              "bg-orange-500", // Curry
              "bg-red-400", // Chutney
              "bg-amber-700", // Roti
              "bg-purple-400", // Dessert
            ];
            
            return (
              <motion.div
                key={i}
                className={`absolute top-1/2 left-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full ${colors[i]}`}
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
      
      {/* CampusGrub text overlay */}
      <motion.div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-[#ea384c] fontLogo whitespace-nowrap"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        CampusGrub
      </motion.div>
    </div>
  );
};
