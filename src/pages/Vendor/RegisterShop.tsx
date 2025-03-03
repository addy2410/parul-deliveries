
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ShopRegistration from "@/components/Vendor/ShopRegistration";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

const RegisterShop = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVendorAuth = async () => {
      try {
        if (isUsingDefaultCredentials()) {
          // In demo mode, check localStorage
          const storedVendorId = localStorage.getItem('currentVendorId');
          if (!storedVendorId) {
            toast.error("You need to login first");
            navigate("/vendor/login");
            return;
          }
          setVendorId(storedVendorId);
        } else {
          // In production, check Supabase auth
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            toast.error("You need to login first");
            navigate("/vendor/login");
            return;
          }
          setVendorId(data.session.user.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/vendor/login");
      }
    };

    checkVendorAuth();
  }, [navigate]);

  const handleShopRegistrationComplete = () => {
    navigate("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/vendor/login")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Register Your Shop</h1>
          
          {vendorId ? (
            <ShopRegistration 
              vendorId={vendorId} 
              onComplete={handleShopRegistrationComplete} 
            />
          ) : (
            <div className="flex justify-center">
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterShop;
