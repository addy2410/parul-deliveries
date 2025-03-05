
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
      const studentId = localStorage.getItem('currentStudentId');
      if (studentId) {
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
      // First check if the user already exists
      const { data: existingUser } = await supabase
        .from('student_users')
        .select('phone')
        .eq('phone', signupPhone)
        .maybeSingle();
      
      if (existingUser) {
        toast.error("This phone number is already registered. Please login instead.");
        setIsLoading(false);
        return;
      }
      
      // Generate a unique email-like identifier for auth
      const email = `${signupPhone}@student.campusgrub.app`;
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: signupPassword,
        options: {
          data: {
            phone: signupPhone,
            name: signupName
          }
        }
      });
      
      if (authError) {
        console.error("Auth signup error:", authError);
        throw authError;
      }
      
      if (!authData.user?.id) {
        throw new Error("Failed to create user account");
      }
      
      // Store additional user data in student_users table
      const { error: studentError } = await supabase
        .from('student_users')
        .insert([
          { 
            id: authData.user.id,
            phone: signupPhone,
            name: signupName,
            password_hash: signupPassword, // In a real app, this should be hashed properly
          }
        ]);
      
      if (studentError) {
        console.error("Failed to create student record:", studentError);
        throw studentError;
      }
      
      // Store user info in localStorage for easy access
      localStorage.setItem('currentStudentId', authData.user.id);
      localStorage.setItem('studentName', signupName);
      localStorage.setItem('studentPhone', signupPhone);
      
      toast.success("Registration successful!");
      navigate("/student/restaurants");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
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
      // Generate the email-like identifier for auth
      const email = `${loginPhone}@student.campusgrub.app`;
      
      // Attempt to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });
      
      if (authError) {
        console.error("Login error:", authError);
        toast.error("Invalid phone number or password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (!authData.user) {
        throw new Error("Failed to authenticate");
      }
      
      // Fetch the student data
      const { data: studentData, error: studentError } = await supabase
        .from('student_users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (studentError || !studentData) {
        console.error("Error fetching student data:", studentError);
        throw new Error("Failed to retrieve student information");
      }
      
      // Store user info in localStorage for easy access
      localStorage.setItem('currentStudentId', studentData.id);
      localStorage.setItem('studentName', studentData.name);
      localStorage.setItem('studentPhone', studentData.phone);
      
      toast.success("Login successful!");
      navigate("/student/restaurants");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials and try again.");
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
