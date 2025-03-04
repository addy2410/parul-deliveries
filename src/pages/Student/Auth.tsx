
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { registerStudent, loginStudent } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const StudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Fields for signup
  const [signupPhone, setSignupPhone] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Fields for login
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/student/restaurants");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupPhone || !signupName || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Basic phone validation
    if (!/^\d{10}$/.test(signupPhone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    // Basic password validation
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registerStudent(signupPhone, signupName, signupPassword);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/student/restaurants");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginPhone || !loginPassword) {
      toast.error("Please enter both phone number and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await loginStudent(loginPhone, loginPassword);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/student/restaurants");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-student-100 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Student Portal</CardTitle>
              <CardDescription className="text-center">
                Login or sign up to order food from campus eateries
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-4 pt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Phone Number</Label>
                    <Input 
                      id="login-phone"
                      placeholder="Enter your phone number"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
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
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-student-600 hover:bg-student-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="p-4 pt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input 
                      id="signup-phone"
                      placeholder="Enter your phone number"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter a 10-digit phone number</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input 
                      id="signup-name"
                      placeholder="Enter your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-student-600 hover:bg-student-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentAuth;
