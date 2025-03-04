
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold mb-8 text-center text-[#ea384c] fontLogo">
              Campus<span className="text-black">Grub</span>
            </h1>

            <div className="prose max-w-none">
              <p className="text-xl text-center mb-12">
                Made By Parul University Dropout Student Aditya Mishra
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
