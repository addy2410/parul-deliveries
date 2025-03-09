
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import RoleSelection from "@/components/RoleSelection";
import { FoodPlate } from "@/components/FoodPlate";

const Index = () => {
  // Add parallax effect to background elements on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      
      parallaxElements.forEach((el) => {
        const speedX = parseFloat((el as HTMLElement).dataset.speedX || "0");
        const speedY = parseFloat((el as HTMLElement).dataset.speedY || "0");
        const rotateSpeed = parseFloat((el as HTMLElement).dataset.rotate || "0");
        
        const isLeftSide = (el as HTMLElement).classList.contains('left-side');
        const isRightSide = (el as HTMLElement).classList.contains('right-side');
        
        let translateX = mouseX * speedX;
        let translateY = mouseY * speedY;
        let rotateValue = mouseX * rotateSpeed;
        
        if (isLeftSide) {
          translateX = -translateX;
        } else if (isRightSide) {
          translateX = translateX;
        }
        
        (el as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotateValue}deg)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      }
    })
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Indian pattern background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 indian-pattern"></div>
      
      {/* Floating food elements */}
      <div className="absolute top-20 left-10 opacity-80 pointer-events-none parallax left-side" data-speed-x="10" data-speed-y="5" data-rotate="-3">
        <motion.img 
          src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc" 
          alt="Decorative food" 
          className="w-28 h-28 object-cover rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 0.8, scale: 1, rotate: -5 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
      
      <div className="absolute top-40 right-12 opacity-80 pointer-events-none parallax right-side" data-speed-x="15" data-speed-y="10" data-rotate="5">
        <motion.img 
          src="https://images.unsplash.com/photo-1505253758473-96b7015fcd40" 
          alt="Spices" 
          className="w-20 h-20 object-cover rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 10 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
      
      <div className="absolute bottom-32 left-14 opacity-80 pointer-events-none parallax left-side" data-speed-x="12" data-speed-y="8" data-rotate="-2">
        <motion.img 
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641" 
          alt="Indian dish" 
          className="w-24 h-24 object-cover rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 0.8, scale: 1, rotate: -8 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>
      
      <div className="absolute bottom-20 right-20 opacity-80 pointer-events-none parallax right-side" data-speed-x="18" data-speed-y="12" data-rotate="8">
        <motion.img 
          src="https://images.unsplash.com/photo-1585937421612-70a008356c36" 
          alt="Decorative food" 
          className="w-32 h-32 object-cover rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 12 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      
      {/* Mobile-visible decorative elements */}
      <div className="md:hidden absolute top-1/3 right-0 transform translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500 rounded-full opacity-30 blur-3xl"></div>
      <div className="md:hidden absolute bottom-1/3 left-0 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-500 rounded-full opacity-20 blur-3xl"></div>

      <header className="py-8 container mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          custom={0}
        >
          <motion.div
            className="relative mb-2"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          >
            <FoodPlate />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center text-[#ea384c] px-2 mb-1"
            variants={fadeInUpVariants}
            custom={1}
          >
            Parul In-Campus Delivery
          </motion.h1>
          <motion.p 
            variants={fadeInUpVariants}
            custom={2}
            className="text-center mt-2 text-gray-700 text-lg md:text-xl max-w-lg mx-auto"
          >
            Craving your favorite campus food? We've got you covered with quick and easy delivery!
          </motion.p>
        </motion.div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
            <RoleSelection />
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-600 relative z-10 mt-4">
        <p>© {new Date().getFullYear()} Parul In-Campus Delivery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
