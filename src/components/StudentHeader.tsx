
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const StudentHeader = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <Link to="/student/restaurants" className="text-xl font-bold fontLogo text-[#ea384c]">
          Campus<span className="text-black">Grub</span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/student/orders/active")}
            className="flex items-center text-sm text-muted-foreground"
          >
            <Clock className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">My Orders</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/student/login")}
            className="flex items-center text-sm text-muted-foreground"
          >
            <User className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Account</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/student/cart")}
            className="relative flex items-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ea384c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default StudentHeader;
