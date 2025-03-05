
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
  const [name, setName] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (isSignup && !name) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, just simulate the OTP flow
        const studentUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
        const existingUser = studentUsers.find((user: any) => user.phone === phoneNumber);
        
        if (existingUser && !isSignup) {
          // Login flow
          toast.success("OTP sent successfully! (Demo Mode)");
          setShowOTP(true);
        } else if (!existingUser && isSignup) {
          // Signup flow
          toast.success("OTP sent successfully! (Demo Mode)");
          setShowOTP(true);
        } else if (existingUser && isSignup) {
          // User exists but trying to sign up
          toast.error("Phone number already registered. Please login instead.");
          setIsSignup(false);
          setIsLoading(false);
          return;
        } else {
          // User doesn't exist but trying to login
          toast.error("Phone number not registered. Please sign up first.");
          setIsSignup(true);
          setIsLoading(false);
          return;
        }
        
      } else {
        // Check if user exists in Supabase
        const { data: existingUsers, error: checkError } = await supabase
          .from('student_users')
          .select('*')
          .eq('phone', phoneNumber);
          
        if (checkError) {
          console.error("Error checking user:", checkError);
          throw new Error("Failed to check user status");
        }
        
        const userExists = existingUsers && existingUsers.length > 0;
        
        if (userExists && !isSignup) {
          // Login flow - use auth for OTP in real implementation
          toast.success("OTP sent successfully!");
          setShowOTP(true);
        } else if (!userExists && isSignup) {
          // Signup flow - use auth for OTP in real implementation
          toast.success("OTP sent successfully!");
          setShowOTP(true);
        } else if (userExists && isSignup) {
          // User exists but trying to sign up
          toast.error("Phone number already registered. Please login instead.");
          setIsSignup(false);
          setIsLoading(false);
          return;
        } else {
          // User doesn't exist but trying to login
          toast.error("Phone number not registered. Please sign up first.");
          setIsSignup(true);
          setIsLoading(false);
          return;
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
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
        if (isSignup) {
          // Create new user in localStorage
          const studentId = `student-${Date.now()}`;
          const studentUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
          
          const newUser = {
            id: studentId,
            phone: phoneNumber,
            name: name,
          };
          
          localStorage.setItem('studentUsers', JSON.stringify([...studentUsers, newUser]));
          localStorage.setItem('currentStudentId', studentId);
          localStorage.setItem('studentName', name);
        } else {
          // Login existing user
          const studentUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
          const existingUser = studentUsers.find((user: any) => user.phone === phoneNumber);
          
          if (existingUser) {
            localStorage.setItem('currentStudentId', existingUser.id);
            localStorage.setItem('studentName', existingUser.name);
          }
        }
        
        toast.success(isSignup ? "Signup successful!" : "Login successful!");
        navigate("/student/restaurants");
      } else {
        if (isSignup) {
          // Create new user in Supabase
          const { data: userData, error: userError } = await supabase
            .from('student_users')
            .insert([
              {
                phone: phoneNumber,
                name: name,
              }
            ])
            .select()
            .single();
            
          if (userError) {
            console.error("Error creating user:", userError);
            throw new Error("Failed to create user account");
          }
          
          // In a real implementation, use Supabase auth with OTP
          toast.success("Signup successful!");
        } else {
          // In a real implementation, verify OTP with Supabase auth
          toast.success("Login successful!");
        }
        
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
              {isSignup ? "Sign up to order food from campus restaurants" : "Login to order food from campus restaurants"}
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
                  
                  {isSignup && (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  
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
            <div className="flex justify-center w-full">
              <Button 
                variant="link" 
                onClick={() => {
                  setIsSignup(!isSignup);
                  setShowOTP(false); // Reset OTP flow when toggling
                }}
                className="text-primary"
              >
                {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
