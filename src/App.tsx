
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { supabase } from "@/lib/supabase";

// Lazy-loaded pages with better chunk naming
const Index = lazy(() => import(/* webpackChunkName: "index" */ "./pages/Index"));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ "./pages/NotFound"));
const VendorLogin = lazy(() => import(/* webpackChunkName: "vendor-login" */ "./pages/Vendor/Login"));
const VendorDashboard = lazy(() => import(/* webpackChunkName: "vendor-dashboard" */ "./pages/Vendor/Dashboard"));
const VendorMenuManagement = lazy(() => import(/* webpackChunkName: "vendor-menu" */ "./pages/Vendor/MenuManagement"));
const RegisterShop = lazy(() => import(/* webpackChunkName: "register-shop" */ "./pages/Vendor/RegisterShop"));
const DeleteEmptyShop = lazy(() => import(/* webpackChunkName: "delete-empty-shop" */ "./pages/Vendor/DeleteEmptyShop"));
const StudentLogin = lazy(() => import(/* webpackChunkName: "student-login" */ "./pages/Student/Login"));
const StudentRestaurants = lazy(() => import(/* webpackChunkName: "student-restaurants" */ "./pages/Student/Restaurants"));
const StudentRestaurantDetail = lazy(() => import(/* webpackChunkName: "restaurant-detail" */ "./pages/Student/RestaurantDetail"));
const StudentCart = lazy(() => import(/* webpackChunkName: "student-cart" */ "./pages/Student/Cart"));
const StudentOrderSuccess = lazy(() => import(/* webpackChunkName: "order-success" */ "./pages/Student/OrderSuccess"));
const StudentOrders = lazy(() => import(/* webpackChunkName: "student-orders" */ "./pages/Student/Orders"));
const OrderTracking = lazy(() => import(/* webpackChunkName: "order-tracking" */ "./pages/Student/OrderTracking"));
const ViewOrder = lazy(() => import(/* webpackChunkName: "view-order" */ "./pages/Student/ViewOrder"));
const AddressBook = lazy(() => import(/* webpackChunkName: "address-book" */ "./pages/Student/AddressBook"));
const About = lazy(() => import(/* webpackChunkName: "about" */ "./pages/About"));
const Community = lazy(() => import(/* webpackChunkName: "community" */ "./pages/Community"));

// Add a custom style to the head for the logo font
const addLogoFontStyle = () => {
  // Only add if not already present
  if (!document.querySelector('style[data-font="poppins"]')) {
    const style = document.createElement('style');
    style.setAttribute('data-font', 'poppins');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
      .fontLogo {
        font-family: 'Poppins', sans-serif;
        letter-spacing: -0.5px;
      }
    `;
    document.head.appendChild(style);
  }
};

// Optimized loading component with reduced DOM nodes
const PageLoading = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
));

// Creating a QueryClient with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    }
  },
});

const App = () => {
  // Add the logo font style when the app loads - wrapped in useEffect for better performance
  useEffect(() => {
    // Load logo font asynchronously with performance optimization
    const loadFonts = async () => {
      // Defer non-critical operations
      if (document.readyState === 'complete') {
        addLogoFontStyle();
      } else {
        window.addEventListener('load', addLogoFontStyle);
        return () => window.removeEventListener('load', addLogoFontStyle);
      }
    };
    
    loadFonts();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/menu" element={<VendorMenuManagement />} />
                <Route path="/vendor/register-shop" element={<RegisterShop />} />
                <Route path="/vendor/delete-empty-shop" element={<DeleteEmptyShop />} />
                
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
                
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                
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
