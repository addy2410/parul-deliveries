
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { supabase } from "@/lib/supabase";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VendorLogin from "./pages/Vendor/Login";
import VendorDashboard from "./pages/Vendor/Dashboard";
import VendorMenuManagement from "./pages/Vendor/MenuManagement";
import RegisterShop from "./pages/Vendor/RegisterShop";
import DeleteEmptyShop from "./pages/Vendor/DeleteEmptyShop";
import AdminAllOrders from "./pages/Vendor/AdminAllOrders";
import StudentLogin from "./pages/Student/Login";
import StudentRestaurants from "./pages/Student/Restaurants";
import StudentRestaurantDetail from "./pages/Student/RestaurantDetail";
import StudentCart from "./pages/Student/Cart";
import StudentOrderSuccess from "./pages/Student/OrderSuccess";
import StudentOrders from "./pages/Student/Orders";
import OrderTracking from "./pages/Student/OrderTracking";
import ViewOrder from "./pages/Student/ViewOrder";
import AddressBook from "./pages/Student/AddressBook";
import About from "./pages/About";

// Add a custom style to the head for the logo font
const addLogoFontStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
    .fontLogo {
      font-family: 'Poppins', sans-serif;
      letter-spacing: -0.5px;
    }
  `;
  document.head.appendChild(style);
};

// Function to clear all test orders
const clearAllTestOrders = async () => {
  try {
    console.log("Clearing all test orders from the database...");
    
    // Delete all orders - fixed to avoid the UUID comparison error
    const { error } = await supabase
      .from('orders')
      .delete()
      .lt('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); // This will delete all orders
    
    if (error) {
      console.error("Error clearing test orders:", error);
    } else {
      console.log("All test orders cleared successfully");
    }
  } catch (err) {
    console.error("Error in clearAllTestOrders:", err);
  }
};

const queryClient = new QueryClient();

const App = () => {
  // Add the logo font style when the app loads
  useEffect(() => {
    addLogoFontStyle();
    
    // Clear all test orders when the app loads
    clearAllTestOrders();
    
    // This will remove any Lovable-related elements that might be added dynamically
    const removeLovableBanner = () => {
      const lovableBanners = document.querySelectorAll('[class*="lovable"],[id*="lovable"]');
      lovableBanners.forEach(banner => banner.remove());
    };
    
    // Run once on load
    removeLovableBanner();
    
    // Set up a mutation observer to remove any Lovable banners that might be added dynamically
    const observer = new MutationObserver(() => {
      removeLovableBanner();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Vendor Routes */}
              <Route path="/vendor/login" element={<VendorLogin />} />
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/menu" element={<VendorMenuManagement />} />
              <Route path="/vendor/register-shop" element={<RegisterShop />} />
              <Route path="/vendor/delete-empty-shop" element={<DeleteEmptyShop />} />
              <Route path="/vendor/admin-all-orders" element={<AdminAllOrders />} />
              
              {/* Student Routes - Allow direct access to restaurants */}
              <Route path="/student" element={<Navigate to="/student/restaurants" replace />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/restaurants" element={<StudentRestaurants />} />
              <Route path="/student/restaurant/:id" element={<StudentRestaurantDetail />} />
              <Route path="/student/cart" element={<StudentCart />} />
              <Route path="/student/order-success" element={<StudentOrderSuccess />} />
              <Route path="/student/orders/:type" element={<StudentOrders />} />
              <Route path="/student/order-tracking/:id" element={<OrderTracking />} />
              <Route path="/student/view-order/:id" element={<ViewOrder />} />
              <Route path="/student/address-book" element={<AddressBook />} />
              
              {/* About Page */}
              <Route path="/about" element={<About />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
