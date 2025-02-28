
import React from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  imageUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, children, imageUrl }) => {
  return (
    <div 
      className={`relative overflow-hidden ${imageUrl ? 'min-h-[500px]' : 'min-h-[300px]'} flex items-center justify-center mb-12`}
    >
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={imageUrl} 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}
      
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 py-12">
        <motion.h1 
          className={`text-5xl md:text-6xl font-bold mb-4 tracking-tight ${imageUrl ? 'text-white' : ''}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            className={`text-xl md:text-2xl mb-8 ${imageUrl ? 'text-gray-200' : 'text-gray-600'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
