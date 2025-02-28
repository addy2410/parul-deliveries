
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const StudentRestaurants = () => {
  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Campus Restaurants</h1>
      <p className="text-muted-foreground mb-8">
        Browse and order from campus restaurants. This is a placeholder for future development.
      </p>
      
      <div className="p-12 border rounded-lg flex items-center justify-center">
        <p className="text-center text-muted-foreground">
          Restaurant listings will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default StudentRestaurants;
