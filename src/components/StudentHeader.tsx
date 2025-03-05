
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface StudentHeaderProps {
  studentName?: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ studentName: propStudentName }) => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  useEffect(() => {
    // If a studentName prop is provided, use it directly
    if (propStudentName) {
      setUserName(propStudentName);
      setIsLoggedIn(true);
      return;
    }
    
    // Otherwise check for a stored session
    const checkStudentSession = () => {
      const studentSession = localStorage.getItem('studentSession');
      if (studentSession) {
        try {
          const { name } = JSON.parse(studentSession);
          setUserName(name);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing student session:", error);
          // If there's an error, clear the session
          handleLogout();
        }
      } else {
        // No session found, but we don't redirect
        setIsLoggedIn(false);
      }
    };
    
    checkStudentSession();
  }, [navigate, propStudentName]);
  
  const handleLogout = () => {
    localStorage.removeItem('studentSession');
    setIsLoggedIn(false);
    setUserName(null);
    navigate('/student/restaurants');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Please log in to view your cart");
      navigate('/student/login');
    }
  };

  return (
    <header className="bg-white shadow py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/student/restaurants" className="flex items-center">
          <img 
            src="/lovable-uploads/6141984c-ed22-4eeb-9eff-2185e2a74953.png" 
            alt="CampusGrub" 
            className="h-7" 
          />
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/student/cart" className="relative" onClick={handleCartClick}>
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              {totalPrice > 0 && (
                <span className="ml-2 text-sm font-medium hidden md:inline">
                  ₹{totalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </Link>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <User className="h-5 w-5" />
                  {userName && <span className="ml-2 hidden md:inline">{userName}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/student/orders/active" className="cursor-pointer w-full">
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/student/address-book" className="cursor-pointer w-full">
                    Address Book
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/student/login')}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
