
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import VendorLogin from "@/pages/Vendor/Login";
import VendorDashboard from "@/pages/Vendor/Dashboard";
import VendorMenuManagement from "@/pages/Vendor/MenuManagement";
import RegisterShop from "@/pages/Vendor/RegisterShop";
import DeleteEmptyShop from "@/pages/Vendor/DeleteEmptyShop";
import StudentLogin from "@/pages/Student/Login";
import StudentRestaurants from "@/pages/Student/Restaurants";
import StudentRestaurantDetail from "@/pages/Student/RestaurantDetail";
import StudentCart from "@/pages/Student/Cart";
import StudentOrderSuccess from "@/pages/Student/OrderSuccess";
import StudentOrders from "@/pages/Student/Orders";
import OrderTracking from "@/pages/Student/OrderTracking";
import ViewOrder from "@/pages/Student/ViewOrder";
import AddressBook from "@/pages/Student/AddressBook";
import About from "@/pages/About";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Vendor Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      <Route path="/vendor/menu" element={<VendorMenuManagement />} />
      <Route path="/vendor/menu-management" element={<VendorMenuManagement />} />
      <Route path="/vendor/register-shop" element={<RegisterShop />} />
      <Route path="/vendor/delete-empty-shop" element={<DeleteEmptyShop />} />
      
      {/* Student Routes */}
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
  );
};

export default AppRouter;
