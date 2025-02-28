
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const StudentCart = () => {
  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/student/restaurants">
          <ArrowLeft size={16} className="mr-2" /> Continue Shopping
        </Link>
      </Button>
      
      <div className="flex items-center mb-6">
        <ShoppingCart className="mr-2" />
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Review your items and checkout. This is a placeholder for future development.
      </p>
      
      <div className="p-12 border rounded-lg flex items-center justify-center">
        <p className="text-center text-muted-foreground">
          Cart functionality will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default StudentCart;
