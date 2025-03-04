
import React, { useState } from "react";
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

const VendorAuth = () => {
  const [pucampid, setPucampid] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pucampid || !password) {
      toast.error("Please enter both PUCAMPID and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const email = `${pucampid.toLowerCase()}@campus-vendor.com`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        throw authError;
      }
      
      toast.success("Login successful");
      
      // Check if vendor has a shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('vendor_id', authData?.user?.id)
        .single();
        
      if (shopError && shopError.code !== 'PGRST116') {
        console.error("Error checking for shop:", shopError);
      }
      
      if (shopData) {
        // Vendor has a shop, redirect to dashboard
        navigate("/vendor/dashboard");
      } else {
        // Vendor doesn't have a shop yet, redirect to shop registration
        navigate("/vendor/register-shop");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <Card className="border-vendor-100 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Vendor Portal</CardTitle>
              <CardDescription className="text-center">
                Login or sign up to manage your campus food business
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
              </TabsContent>
              
              <TabsContent value="signup" className="p-4 pt-0">
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
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-xs text-gray-500 mt-4">
                <p>For demonstration purposes, enter any PUCAMPID that starts with "VEN" (like VEN12345) and a password with at least 6 characters.</p>
                <p className="mt-1">Or try the default restaurants with these credentials:</p>
                <p className="font-semibold mt-1">CAPITOL-VENDOR / GREENZY-VENDOR / MAIN-VENDOR</p>
                <p>Password for all: campus123</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorAuth;
