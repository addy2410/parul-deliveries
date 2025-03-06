import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import StudentLogin from '@/pages/Student/Login';
import StudentSignup from '@/pages/Student/Signup';
import StudentDashboard from '@/pages/Student/Dashboard';
import VendorLogin from '@/pages/Vendor/Login';
import VendorDashboard from '@/pages/Vendor/Dashboard';
import VendorMenuManagement from '@/pages/Vendor/MenuManagement';
import StudentRestaurants from '@/pages/Student/Restaurants';
import RestaurantDetail from '@/pages/Student/RestaurantDetail';
import Cart from '@/pages/Student/Cart';
import Orders from '@/pages/Student/Orders';
import VendorOrders from '@/pages/Vendor/Orders';
import VendorRegisterShop from '@/pages/Vendor/RegisterShop';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/menu-management" element={<VendorMenuManagement />} />
        <Route path="/student/restaurants" element={<StudentRestaurants />} />
        <Route path="/student/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/student/orders" element={<Orders />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/register-shop" element={<VendorRegisterShop />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

