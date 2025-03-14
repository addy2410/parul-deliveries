
import React from "react";
import { Link } from "react-router-dom";
import RoleSelection from "@/components/RoleSelection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HeroSection from "@/components/ui/HeroSection";
import { ClearAllOrders } from "@/components/ClearAllOrders";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        title="Campus Food Delivery"
        subtitle="Hungry? Order food from your favorite campus restaurants!"
        cta={<RoleSelection />}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Admin Controls</h2>
          <p className="text-muted-foreground mb-4">
            Use these controls with caution
          </p>
          <ClearAllOrders />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2">Students</Badge>
              <CardTitle>Order Food</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse restaurants, place orders, and track delivery in real-time.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/student/restaurants">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-vendor-500">Vendors</Badge>
              <CardTitle>Manage Restaurant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Register your restaurant, manage menu items, and fulfill orders.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-vendor-600 hover:bg-vendor-700">
                <Link to="/vendor/login">Vendor Login</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-blue-500">Community</Badge>
              <CardTitle>About the Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Learn about the campus food delivery project and its features.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/about">Learn More</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
