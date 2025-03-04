
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentHeaderProps {
  studentName?: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ studentName: propStudentName }) => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState(propStudentName || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getStudentName = async () => {
      if (propStudentName) {
        setStudentName(propStudentName);
        setIsLoggedIn(true);
        return;
      }

      try {
        // Check for student info in localStorage (used by both demo and production)
        const storedName = localStorage.getItem('studentName');
        const storedId = localStorage.getItem('currentStudentId');
        
        if (storedName && storedId) {
          setStudentName(storedName);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching student name:", error);
        setIsLoggedIn(false);
      }
    };

    getStudentName();
  }, [propStudentName]);

  const handleLogout = () => {
    if (!isUsingDefaultCredentials()) {
      // In production, use Supabase auth
      supabase.auth.signOut();
    }

    // Clear local storage (works for both demo and production)
    localStorage.removeItem('currentStudentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentPhone');
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Navigate to login
    navigate('/student/login');
    
    toast.success("Logged out successfully");
  };

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
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-sm text-muted-foreground"
                >
                  <User className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Account</span>
                  {studentName && (
                    <span className="ml-1 text-xs opacity-75 hidden sm:inline">({studentName})</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/student/address-book")}>
                  Address Book
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/student/orders/active")}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/student/login")}
              className="flex items-center text-sm text-muted-foreground"
            >
              <User className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
          
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
