import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Cart from "@/components/Cart";

const StudentHeader = () => {
  const { items } = useCart();
  const navigate = useNavigate();
  const totalItemsInCart = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/student/restaurants" className="flex items-center">
              <img 
                src="/lovable-uploads/66a8fbfe-db5c-45b2-a572-42477b6e107e.png" 
                alt="Parul In-Campus Delivery" 
                className="h-8 mr-2" 
              />
              <span className="font-bold text-xl hidden md:inline-block">CampusGrub</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ShoppingCart className="mr-2" size={20} />
                  Cart
                  {totalItemsInCart > 0 && (
                    <div className="absolute top-[-6px] right-[-6px] bg-secondary text-secondary-foreground rounded-full text-xs font-bold h-5 w-5 flex items-center justify-center">
                      {totalItemsInCart}
                    </div>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg p-0">
                <SheetHeader className="p-6">
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <SheetDescription>
                    Review items in your cart and proceed to checkout.
                  </SheetDescription>
                </SheetHeader>
                <Cart />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
