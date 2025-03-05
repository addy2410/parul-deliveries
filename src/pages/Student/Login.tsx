
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const StudentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check if there's a query param for tab
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "login";
  });
  
  // Check if user is already logged in as a student
  useEffect(() => {
    const checkStudentSession = async () => {
      const currentStudentId = localStorage.getItem('currentStudentId');
      
      // If there's a student ID in localStorage, we consider them logged in
      if (currentStudentId) {
        navigate("/student/restaurants");
      }
    };
    
    checkStudentSession();
    
    // Check if we have a registration success message from the URL
    const params = new URLSearchParams(location.search);
    const registrationSuccess = params.get("registered");
    
    if (registrationSuccess === "true") {
      toast.success("Registration successful! Please log in.");
      // Clear the URL parameter
      navigate("/student/login", { replace: true });
    }
  }, [navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to log in with email:", email);
      
      // Call our edge function to verify student credentials
      const response = await supabase.functions.invoke('verify-student-password', {
        body: { email, password }
      });
      
      console.log("Login response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Login failed");
      }
      
      const data = response.data;
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Login failed");
      }
      
      // Login successful - store user details in localStorage
      localStorage.setItem('currentStudentId', data.userId);
      localStorage.setItem('studentName', data.name);
      localStorage.setItem('studentEmail', data.email);
      localStorage.setItem('studentPhone', data.phone || '');
      
      toast.success("Login successful!");
      navigate("/student/restaurants");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !phoneNumber || !name || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign up with email:", email);
      
      // Call the create-student-user edge function
      const response = await supabase.functions.invoke('create-student-user', {
        body: { phone: phoneNumber, name, password, email }
      });
      
      console.log("Signup response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Signup failed");
      }
      
      const data = response.data;
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Signup failed");
      }
      
      // Registration successful, redirect to login with notification
      toast.success("Account created successfully! Please log in.");
      setActiveTab("login");
      navigate("/student/login?registered=true");
      
      // Clear signup form
      setName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
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
              {activeTab === "signup" 
                ? "Sign up to order food from campus restaurants" 
                : "Login to order food from campus restaurants"}
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="space-y-4 pt-4">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="signup-name">Your Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex flex-col">
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
