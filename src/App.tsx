import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { supabase } from "@/lib/supabase";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VendorLogin = lazy(() => import("./pages/Vendor/Login"));
const VendorDashboard = lazy(() => import("./pages/Vendor/Dashboard"));
const VendorMenuManagement = lazy(() => import("./pages/Vendor/MenuManagement"));
const RegisterShop = lazy(() => import("./pages/Vendor/RegisterShop"));
const DeleteEmptyShop = lazy(() => import("./pages/Vendor/DeleteEmptyShop"));
const StudentLogin = lazy(() => import("./pages/Student/Login"));
const StudentRestaurants = lazy(() => import("./pages/Student/Restaurants"));
const StudentRestaurantDetail = lazy(() => import("./pages/Student/RestaurantDetail"));
const StudentCart = lazy(() => import("./pages/Student/Cart"));
const StudentOrderSuccess = lazy(() => import("./pages/Student/OrderSuccess"));
const StudentOrders = lazy(() => import("./pages/Student/Orders"));
const OrderTracking = lazy(() => import("./pages/Student/OrderTracking"));
const ViewOrder = lazy(() => import("./pages/Student/ViewOrder"));
const AddressBook = lazy(() => import("./pages/Student/AddressBook"));
const About = lazy(() => import("./pages/About"));
const Community = lazy(() => import("./pages/Community"));

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

// Loading component for suspense fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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

// Creating a QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      suspense: false,
    },
  },
});

const App = () => {
  // Add the logo font style when the app loads
  useEffect(() => {
    // Load logo font asynchronously
    const loadFonts = async () => {
      // First check if font is already loaded
      if (!document.querySelector('style[data-font="poppins"]')) {
        addLogoFontStyle();
      }
    };
    
    loadFonts();
    
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
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Vendor Routes */}
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/menu" element={<VendorMenuManagement />} />
                <Route path="/vendor/register-shop" element={<RegisterShop />} />
                <Route path="/vendor/delete-empty-shop" element={<DeleteEmptyShop />} />
                
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
                
                {/* About and Community Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
