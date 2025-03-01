
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Home, Clock } from "lucide-react";
import { motion } from "framer-motion";

const StudentOrderSuccess = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. Your delicious food is being prepared and will be delivered soon.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center mb-2">
            <Clock className="text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Estimated Delivery Time</h3>
          </div>
          <p className="text-yellow-700">20-30 minutes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-student-600 hover:bg-student-700">
            <Link to="/student/restaurants">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentOrderSuccess;
