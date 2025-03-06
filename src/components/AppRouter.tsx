
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import RoleSelection from "@/components/RoleSelection";
import About from "@/pages/About";

// Student routes
import StudentLogin from "@/pages/Student/Login";
import Restaurants from "@/pages/Student/Restaurants";
import RestaurantDetail from "@/pages/Student/RestaurantDetail";
import Cart from "@/pages/Student/Cart";
import OrderSuccess from "@/pages/Student/OrderSuccess";
import OrderTracking from "@/pages/Student/OrderTracking";
import Orders from "@/pages/Student/Orders";
import ViewOrder from "@/pages/Student/ViewOrder";
import AddressBook from "@/pages/Student/AddressBook";

// Vendor routes
import VendorLogin from "@/pages/Vendor/Login";
import RegisterShop from "@/pages/Vendor/RegisterShop";
import DeleteEmptyShop from "@/pages/Vendor/DeleteEmptyShop";
import VendorDashboard from "@/pages/Vendor/Dashboard";
import VendorMenuManagement from "@/pages/Vendor/MenuManagement";

// Root layout
import { Toaster } from "@/components/ui/sonner";

const AppRouter = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        
        {/* Student routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/restaurants" element={<Restaurants />} />
        <Route path="/student/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/student/cart" element={<Cart />} />
        <Route path="/student/order-success" element={<OrderSuccess />} />
        <Route path="/student/order-tracking/:id" element={<OrderTracking />} />
        <Route path="/student/orders" element={<Orders />} />
        <Route path="/student/view-order/:id" element={<ViewOrder />} />
        <Route path="/student/address-book" element={<AddressBook />} />
        
        {/* Vendor routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register-shop" element={<RegisterShop />} />
        <Route path="/vendor/delete-empty-shop" element={<DeleteEmptyShop />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/menu-management" element={<VendorMenuManagement />} />
        
        {/* Fallback for not found routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
