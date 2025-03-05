
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !password) {
      toast.error("Please enter both phone number and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // Demo mode
        const studentUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
        const existingUser = studentUsers.find((user: any) => user.phone === phoneNumber && user.password === password);
        
        if (existingUser) {
          localStorage.setItem('currentStudentId', existingUser.id);
          localStorage.setItem('studentName', existingUser.name);
          toast.success("Login successful!");
          navigate("/student/restaurants");
        } else {
          toast.error("Invalid credentials. Please check your phone number and password.");
        }
      } else {
        // Supabase authentication
        // Query for the student with this phone number
        const { data: students, error: fetchError } = await supabase
          .from('student_users')
          .select('*')
          .eq('phone', phoneNumber)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching student:", fetchError);
          throw new Error("Failed to authenticate");
        }
        
        if (!students) {
          toast.error("Phone number not registered. Please sign up first.");
          setActiveTab("signup");
          return;
        }
        
        // Verify the password
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-student-password', {
          body: { 
            phone: phoneNumber,
            password: password
          }
        });
        
        if (verifyError || !verifyData?.success) {
          toast.error("Invalid credentials. Please check your password.");
          return;
        }
        
        // Login successful
        localStorage.setItem('currentStudentId', students.id);
        localStorage.setItem('studentName', students.name);
        toast.success("Login successful!");
        navigate("/student/restaurants");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !name || !password) {
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
      if (isUsingDefaultCredentials()) {
        // Demo mode
        const studentUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
        const existingUser = studentUsers.find((user: any) => user.phone === phoneNumber);
        
        if (existingUser) {
          toast.error("Phone number already registered. Please login instead.");
          setActiveTab("login");
          return;
        }
        
        // Create new user
        const studentId = `student-${Date.now()}`;
        const newUser = {
          id: studentId,
          phone: phoneNumber,
          name: name,
          password: password
        };
        
        localStorage.setItem('studentUsers', JSON.stringify([...studentUsers, newUser]));
        localStorage.setItem('currentStudentId', studentId);
        localStorage.setItem('studentName', name);
        
        toast.success("Signup successful!");
        navigate("/student/restaurants");
      } else {
        // Check if phone number already exists
        const { data: existingUsers, error: checkError } = await supabase
          .from('student_users')
          .select('phone')
          .eq('phone', phoneNumber);
          
        if (checkError) {
          console.error("Error checking existing user:", checkError);
          throw new Error("Failed to check user status");
        }
        
        if (existingUsers && existingUsers.length > 0) {
          toast.error("Phone number already registered. Please login instead.");
          setActiveTab("login");
          return;
        }
        
        // Create new user with hashed password
        const { data: signupData, error: signupError } = await supabase.functions.invoke('create-student-user', {
          body: { 
            phone: phoneNumber,
            name: name,
            password: password
          }
        });
        
        if (signupError || !signupData?.success) {
          console.error("Signup error:", signupError || signupData?.error);
          throw new Error(signupData?.error || "Failed to create user account");
        }
        
        // Set local storage for the session
        localStorage.setItem('currentStudentId', signupData.userId);
        localStorage.setItem('studentName', name);
        
        toast.success("Signup successful!");
        navigate("/student/restaurants");
      }
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
                      <Label htmlFor="login-phone">Phone Number</Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
