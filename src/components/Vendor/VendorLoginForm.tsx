
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface VendorLoginFormProps {
  pucampid: string;
  setPucampid: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const VendorLoginForm: React.FC<VendorLoginFormProps> = ({
  pucampid,
  setPucampid,
  password,
  setPassword,
  isLoading,
  setIsLoading,
}) => {
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pucampid || !password) {
      toast.error("Please enter both PUCAMPID and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedPucampid = pucampid.toUpperCase();
      const email = `${formattedPucampid.toLowerCase()}@vendor.campusgrub.app`;
      
      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error("Login error:", authError);
        toast.error("Invalid PUCAMPID or password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (!authData.user) {
        throw new Error("Failed to authenticate");
      }
      
      // Store user info in localStorage
      localStorage.setItem('currentVendorId', authData.user.id);
      localStorage.setItem('vendorPUCAMPID', formattedPucampid);
      
      // Check if vendor has a shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('vendor_id', authData.user.id)
        .maybeSingle();
        
      if (shopError && shopError.code !== 'PGRST116') {
        console.error("Error checking for shop:", shopError);
      }
      
      toast.success("Login successful");
      
      if (shopData) {
        // Vendor has a shop, redirect to dashboard
        navigate("/vendor/dashboard");
      } else {
        // Vendor doesn't have a shop yet, redirect to shop registration
        navigate("/vendor/register-shop");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-pucampid">PUCAMPID</Label>
        <Input 
          id="login-pucampid"
          placeholder="Enter your PUCAMPID (e.g., VEN12345)"
          value={pucampid}
          onChange={(e) => setPucampid(e.target.value)}
          autoComplete="username"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <a 
            href="#" 
            className="text-sm text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Password reset functionality would be implemented here");
            }}
          >
            Forgot password?
          </a>
        </div>
        <Input 
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vendor-600 hover:bg-vendor-700"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default VendorLoginForm;
