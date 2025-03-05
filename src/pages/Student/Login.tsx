
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
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
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error(authError.message || "Invalid login credentials");
        return;
      }
      
      // Check if this user exists in the student_users table
      const { data: studentData, error: fetchError } = await supabase
        .from('student_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching student:", fetchError);
        throw new Error("Failed to authenticate");
      }
      
      if (!studentData) {
        // Sign out from Supabase since this is not a student account
        await supabase.auth.signOut();
        toast.error("This email is not registered as a student. Please sign up first.");
        setActiveTab("signup");
        return;
      }
      
      // Login successful
      localStorage.setItem('currentStudentId', studentData.id);
      localStorage.setItem('studentName', studentData.name);
      localStorage.setItem('studentEmail', email);
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
      // First check if phone number is already registered
      const { data: existingPhoneCheck, error: phoneCheckError } = await supabase
        .from('student_users')
        .select('phone')
        .eq('phone', phoneNumber);
        
      if (phoneCheckError) {
        console.error("Error checking existing phone:", phoneCheckError);
        throw new Error("Failed to check user status");
      }
      
      if (existingPhoneCheck && existingPhoneCheck.length > 0) {
        toast.error("Phone number already registered. Please login instead.");
        setActiveTab("login");
        return;
      }
      
      // Now check if email is already registered
      const { data: existingEmailCheck, error: emailCheckError } = await supabase
        .from('student_users')
        .select('email')
        .eq('email', email);
        
      if (emailCheckError) {
        console.error("Error checking existing email:", emailCheckError);
        throw new Error("Failed to check user status");
      }
      
      if (existingEmailCheck && existingEmailCheck.length > 0) {
        toast.error("Email already registered. Please login instead.");
        setActiveTab("login");
        return;
      }
      
      // Create the auth user first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: phoneNumber
          }
        }
      });
      
      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw new Error(signUpError.message || "Failed to create user account");
      }
      
      // Create the student user profile
      const { data: studentData, error: createStudentError } = await supabase
        .from('student_users')
        .insert([
          { 
            id: authData.user?.id,
            name,
            phone: phoneNumber,
            email,
          }
        ])
        .select()
        .single();
      
      if (createStudentError) {
        console.error("Error creating student:", createStudentError);
        // If there's an error creating the student profile, try to clean up the auth user
        await supabase.auth.signOut();
        throw new Error("Failed to create student profile. Please try again.");
      }
      
      // Set local storage for the session
      localStorage.setItem('currentStudentId', authData.user?.id || '');
      localStorage.setItem('studentName', name);
      localStorage.setItem('studentEmail', email);
      
      toast.success("Signup successful!");
      navigate("/student/restaurants");
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
