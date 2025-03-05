
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ShopRegistration from "@/components/Vendor/ShopRegistration";
import { supabase } from "@/lib/supabase";

const RegisterShop = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasShop, setHasShop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVendorAuth = async () => {
      try {
        setLoading(true);
        
        // Check Supabase auth
        const { data, error } = await supabase.auth.getSession();
        console.log("Auth session data:", data?.session ? "Session exists" : "No session");
        
        if (error) {
          console.error("Auth error:", error.message);
          toast.error(`Authentication error: ${error.message}`);
          navigate("/vendor/login");
          return;
        }
        
        if (!data.session) {
          toast.error("You need to login first");
          navigate("/vendor/login");
          return;
        }
        
        const userId = data.session.user.id;
        setVendorId(userId);
        
        // Check if vendor already has a shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('vendor_id', userId);
          
        if (shopError) {
          console.error("Error checking for shop:", shopError);
        } else if (shopData && shopData.length > 0) {
          // Vendor already has a shop, redirect to dashboard
          setHasShop(true);
          toast.info("You already have a registered shop");
          navigate("/vendor/dashboard");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/vendor/login");
      } finally {
        setLoading(false);
      }
    };

    checkVendorAuth();
  }, [navigate]);

  const handleShopRegistrationComplete = () => {
    toast.success("Shop registered successfully! Redirecting to dashboard...");
    setTimeout(() => {
      navigate("/vendor/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/vendor/login")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Register Your Shop</h1>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <p>Loading authentication status...</p>
            </div>
          ) : hasShop ? (
            <div className="flex justify-center p-8">
              <p>You already have a registered shop. Redirecting to dashboard...</p>
            </div>
          ) : vendorId ? (
            <ShopRegistration 
              vendorId={vendorId} 
              onComplete={handleShopRegistrationComplete} 
            />
          ) : (
            <div className="flex justify-center">
              <p>Authentication error. Please try logging in again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterShop;
