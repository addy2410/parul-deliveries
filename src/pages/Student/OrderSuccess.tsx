
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Home, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import StudentHeader from "@/components/StudentHeader";

const StudentOrderSuccess = () => {
  // In a real app, this would come from the order creation flow
  const orderId = "order-" + Math.floor(1000 + Math.random() * 9000);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 fontLogo">Order Placed Successfully!</h1>
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
            <Button asChild className="bg-[#ea384c] hover:bg-[#d02e40]">
              <Link to="/student/restaurants" className="flex items-center">
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="border-[#ea384c] text-[#ea384c] hover:bg-red-50">
              <Link to={`/student/order-tracking/${orderId}`} className="flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" /> Track Order
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentOrderSuccess;
