
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, just simulate the OTP flow
        toast.success("OTP sent successfully! (Demo Mode)");
        setShowOTP(true);
        
        // Store the phone number in localStorage for demo purposes
        localStorage.setItem('studentPhone', phoneNumber);
      } else {
        // In production, would use Supabase auth
        // This is a placeholder for real phone auth
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
        });
        
        if (error) {
          throw error;
        }
        
        toast.success("OTP sent successfully!");
        setShowOTP(true);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, just pretend the OTP is correct
        localStorage.setItem('currentStudentId', 'demo-student-123');
        localStorage.setItem('studentName', 'Demo Student');
        toast.success("Login successful! (Demo Mode)");
        navigate("/student/restaurants");
      } else {
        // In production, would verify with Supabase
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms',
        });
        
        if (error) {
          throw error;
        }
        
        toast.success("Login successful!");
        navigate("/student/restaurants");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl fontLogo">Campus Grub</CardTitle>
            <CardDescription>
              Login to order food from campus restaurants
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!showOTP ? (
              <form onSubmit={handleSendOTP}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your phone"
                      value={otp}
                      onChange={(e) => setOTP(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-center text-muted-foreground mt-4">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
