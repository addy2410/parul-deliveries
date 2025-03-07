
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useStudentAuth } from "@/hooks/useStudentAuth";

interface StudentHeaderProps {
  studentName?: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ studentName: propStudentName }) => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { studentName: authStudentName, isAuthenticated, logout } = useStudentAuth();
  
  // We'll use auth hook directly instead of maintaining separate state
  const userName = propStudentName || authStudentName;
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/student/restaurants');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error("Please log in to view your cart");
      navigate('/student/login');
    }
  };

  return (
    <header className="bg-white shadow py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/student/restaurants" className="flex items-center">
          <span className="text-xl font-bold fontLogo text-primary">
            CampusGrub
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/student/cart" className="relative" onClick={handleCartClick}>
            <img 
              src="/lovable-uploads/10b67b49-52f1-4d6d-a7b3-1deeb87e3606.png" 
              alt="Shopping Cart" 
              className="h-8 w-8" 
            />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
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
