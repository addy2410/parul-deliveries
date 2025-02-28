
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VendorMenuManagement = () => {
  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/vendor/dashboard">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      <p className="text-muted-foreground mb-8">
        This page will allow vendors to manage their menu items. This is a placeholder for future development.
      </p>
      
      <div className="p-12 border rounded-lg flex items-center justify-center">
        <p className="text-center text-muted-foreground">
          Menu management functionality will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default VendorMenuManagement;
