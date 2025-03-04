
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface VendorSignupFormProps {
  pucampid: string;
  setPucampid: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const VendorSignupForm: React.FC<VendorSignupFormProps> = ({
  pucampid,
  setPucampid,
  password,
  setPassword,
  isLoading,
  setIsLoading,
}) => {
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pucampid || !password) {
      toast.error("Please enter both PUCAMPID and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const email = `${pucampid.toLowerCase()}@campus-vendor.com`;
      
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: password + "dummy", // Use a dummy password to avoid correct login
      });
      
      if (!checkError) {
        // User exists
        toast.error("This PUCAMPID is already registered. Please login instead.");
        return;
      }
      
      // User doesn't exist, continue with signup
      if (pucampid.startsWith("VEN") && password.length >= 6) {
        // Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        
        toast.success("Account created successfully. Please login.");
        navigate("/vendor/register-shop");
      } else {
        toast.error("PUCAMPID must start with 'VEN' and password must be at least 6 characters");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-pucampid">PUCAMPID</Label>
        <Input 
          id="signup-pucampid"
          placeholder="Enter your PUCAMPID (e.g., VEN12345)"
          value={pucampid}
          onChange={(e) => setPucampid(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">PUCAMPID must start with "VEN"</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vendor-600 hover:bg-vendor-700"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default VendorSignupForm;
