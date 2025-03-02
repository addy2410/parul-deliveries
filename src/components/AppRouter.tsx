
import React from "react";
import { Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import StudentLogin from "@/pages/Student/Login";
import StudentRestaurants from "@/pages/Student/Restaurants";
import StudentRestaurantDetail from "@/pages/Student/RestaurantDetail";
import StudentCart from "@/pages/Student/Cart";
import StudentOrderSuccess from "@/pages/Student/OrderSuccess";
import StudentOrderTracking from "@/pages/Student/OrderTracking";
import StudentOrders from "@/pages/Student/Orders";
import StudentViewOrder from "@/pages/Student/ViewOrder";
import StudentAddressBook from "@/pages/Student/AddressBook";
import VendorLogin from "@/pages/Vendor/Login";
import VendorDashboard from "@/pages/Vendor/Dashboard";
import VendorMenuManagement from "@/pages/Vendor/MenuManagement";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      
      {/* Student Routes */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/restaurants" element={<StudentRestaurants />} />
      <Route path="/student/restaurant/:id" element={<StudentRestaurantDetail />} />
      <Route path="/student/cart" element={<StudentCart />} />
      <Route path="/student/order-success" element={<StudentOrderSuccess />} />
      <Route path="/student/order-tracking/:id" element={<StudentOrderTracking />} />
      <Route path="/student/orders" element={<StudentOrders />} />
      <Route path="/student/order/:id" element={<StudentViewOrder />} />
      <Route path="/student/address-book" element={<StudentAddressBook />} />
      
      {/* Vendor Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      <Route path="/vendor/menu" element={<VendorMenuManagement />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
