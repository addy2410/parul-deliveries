
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VendorLogin from "./pages/Vendor/Login";
import VendorDashboard from "./pages/Vendor/Dashboard";
import VendorMenuManagement from "./pages/Vendor/MenuManagement";
import StudentRestaurants from "./pages/Student/Restaurants";
import StudentRestaurantDetail from "./pages/Student/RestaurantDetail";
import StudentCart from "./pages/Student/Cart";
import StudentOrderSuccess from "./pages/Student/OrderSuccess";

const queryClient = new QueryClient();

const App = () => (
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
            
            {/* Student Routes */}
            <Route path="/student/restaurants" element={<StudentRestaurants />} />
            <Route path="/student/restaurant/:id" element={<StudentRestaurantDetail />} />
            <Route path="/student/cart" element={<StudentCart />} />
            <Route path="/student/order-success" element={<StudentOrderSuccess />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
