
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    toast.success("OTP sent successfully!");
    setShowOTP(true);
  };
  
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    
    // In a real app, this would validate the OTP with a backend service
    toast.success("Login successful!");
    navigate("/student/restaurants");
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
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#ea384c] hover:bg-[#d02e40]">
                    Send OTP
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
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#ea384c] hover:bg-[#d02e40]">
                    Verify OTP
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
