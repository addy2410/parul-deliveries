import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";

interface StudentHeaderProps {
  studentName?: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ studentName: propStudentName }) => {
  const navigate = useNavigate();
  const { items } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    // If a studentName prop is provided, use it directly
    if (propStudentName) {
      setUserName(propStudentName);
      return;
    }
    
    // Otherwise check for a stored session
    const checkStudentSession = () => {
      const studentSession = localStorage.getItem('studentSession');
      if (studentSession) {
        try {
          const { name } = JSON.parse(studentSession);
          setUserName(name);
        } catch (error) {
          console.error("Error parsing student session:", error);
          // If there's an error, clear the session and redirect to login
          handleLogout();
        }
      } else {
        // No session found, redirect to login
        navigate('/student/login');
      }
    };
    
    checkStudentSession();
  }, [navigate, propStudentName]);
  
  const handleLogout = () => {
    localStorage.removeItem('studentSession');
    navigate('/student/login');
  };

  return (
    <header className="bg-white shadow py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/student/restaurants" className="flex items-center">
          <span className="text-xl font-bold fontLogo text-primary">
            Campus Eats
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/student/cart" className="relative">
            <ShoppingBag className="h-6 w-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

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
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
