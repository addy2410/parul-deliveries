
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
      {/* College campus background illustration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
          <path fill="#ea384c" fillOpacity="0.3" d="M0,96L48,106.7C96,117,192,139,288,149.3C384,160,480,160,576,138.7C672,117,768,75,864,80C960,85,1056,139,1152,144C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#fb923c" fillOpacity="0.2" d="M0,32L48,58.7C96,85,192,139,288,149.3C384,160,480,128,576,106.7C672,85,768,75,864,80C960,85,1056,107,1152,133.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Indian pattern background - Rajasthani-inspired */}
      <div className="absolute inset-0 pointer-events-none opacity-10 rajasthani-pattern"></div>
      
      {/* Floating food elements with culturally relevant dishes */}
      <div className="absolute top-20 left-10 opacity-90 pointer-events-none parallax left-side" data-speed-x="10" data-speed-y="5" data-rotate="-3">
        <motion.div
          className="w-28 h-28 rounded-full shadow-lg overflow-hidden" 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 0.9, scale: 1, rotate: -5 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1505253758473-96b7015fcd40" 
            alt="Indian Spices" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
            <span className="text-white text-xs font-medium">Rajasthani Spices</span>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute top-40 right-12 opacity-90 pointer-events-none parallax right-side" data-speed-x="15" data-speed-y="10" data-rotate="5">
        <motion.div
          className="w-20 h-20 rounded-full shadow-lg overflow-hidden" 
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 10 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc" 
            alt="South Indian Dosa" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
            <span className="text-white text-[10px] font-medium">Dosa</span>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-32 left-14 opacity-90 pointer-events-none parallax left-side" data-speed-x="12" data-speed-y="8" data-rotate="-2">
        <motion.div
          className="w-24 h-24 rounded-full shadow-lg overflow-hidden" 
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1565557623262-b51c2513a641" 
            alt="Gujarati Thali" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
            <span className="text-white text-xs font-medium">Gujarati Thali</span>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-20 right-20 opacity-90 pointer-events-none parallax right-side" data-speed-x="18" data-speed-y="12" data-rotate="8">
        <motion.div
          className="w-32 h-32 rounded-full shadow-lg overflow-hidden" 
          initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 12 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1585937421612-70a008356c36" 
            alt="Rajasthani Dal Baati" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
            <span className="text-white text-xs font-medium">Dal Baati</span>
          </div>
        </motion.div>
      </div>
      
      {/* Traditional kolam/rangoli decorative elements */}
      <div className="absolute top-1/4 right-1/4 transform -translate-y-1/2 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#ea384c" d="M100,20 A80,80 0 1,0 100,180 A80,80 0 1,0 100,20 Z M100,40 A60,60 0 1,1 100,160 A60,60 0 1,1 100,40 Z M100,60 A40,40 0 1,0 100,140 A40,40 0 1,0 100,60 Z M100,80 A20,20 0 1,1 100,120 A20,20 0 1,1 100,80 Z"></path>
        </svg>
      </div>
      
      <div className="absolute bottom-1/4 left-1/4 transform translate-y-1/2 w-48 h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g fill="#fb923c">
            <path d="M100,10 L120,50 L160,50 L130,80 L140,120 L100,100 L60,120 L70,80 L40,50 L80,50 Z"></path>
            <path d="M100,40 L110,60 L130,60 L115,75 L120,95 L100,85 L80,95 L85,75 L70,60 L90,60 Z"></path>
          </g>
        </svg>
      </div>
      
      {/* Mobile-visible decorative elements */}
      <div className="md:hidden absolute top-1/3 right-0 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="md:hidden absolute bottom-1/3 left-0 transform -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-red-500 rounded-full opacity-20 blur-3xl"></div>

      <header className="py-8 container mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          custom={0}
        >
          <motion.div
            className="relative mb-4"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          >
            <FoodPlate />
          </motion.div>
          
          <motion.div
            className="relative"
            variants={fadeInUpVariants}
            custom={1}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-center px-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#ea384c] to-orange-600">
              Parul In-Campus Delivery
            </h1>
            {/* Decorative border inspired by Rajasthani designs */}
            <div className="mx-auto w-32 h-2 bg-gradient-to-r from-[#ea384c] to-orange-500 rounded-full mb-2"></div>
          </motion.div>
          
          <motion.p 
            variants={fadeInUpVariants}
            custom={2}
            className="text-center mt-2 text-gray-700 text-lg md:text-xl max-w-2xl mx-auto px-4"
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 relative overflow-hidden">
            {/* Decorative corner patterns inspired by Indian art */}
            <div className="absolute top-0 left-0 w-24 h-24 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ea384c" d="M0,0 L50,0 A50,50 0 0,1 0,50 Z"></path>
                <path fill="#fb923c" d="M10,0 L40,0 A40,40 0 0,1 0,40 L0,10 Z"></path>
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none rotate-180">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ea384c" d="M0,0 L50,0 A50,50 0 0,1 0,50 Z"></path>
                <path fill="#fb923c" d="M10,0 L40,0 A40,40 0 0,1 0,40 L0,10 Z"></path>
              </svg>
            </div>
            
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
