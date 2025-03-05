
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

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Output some debug info
      console.log(`Attempting to log in vendor with email: ${email}`);
      
      // Hard-coded vendor credentials for specific food courts
      const vendorCredentials = [
        { email: "greenzy@campus.com", password: "green123", name: "GREENZY Food Court" },
        { email: "main@campus.com", password: "main123", name: "Main Food Court" }
      ];
      
      // Check if using one of our hardcoded credentials
      const matchingVendor = vendorCredentials.find(
        v => v.email === email && v.password === password
      );
      
      if (matchingVendor) {
        toast.success(`Login successful as ${matchingVendor.name}`);
        
        // Create a mock session for the hardcoded vendor
        const mockSession = {
          user: {
            id: `vendor-${email.split('@')[0]}`,
            email: email,
            user_metadata: { name: matchingVendor.name }
          }
        };
        
        // Store mock session in localStorage
        localStorage.setItem('vendorSession', JSON.stringify(mockSession));
        
        // Check if vendor has a shop - for hardcoded vendors, they always have a shop
        navigate("/vendor/dashboard");
        return;
      }
      
      // For regular vendors, use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        toast.success("Login successful");
        
        // Check if vendor has a shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('vendor_id', data.user.id)
          .maybeSingle();
          
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
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email is a valid format
      if (!isValidEmail(email)) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      
      // Create new user with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          toast.error("This email is already registered. Please login instead.");
          setActiveTab("login");
        } else {
          toast.error(`Signup failed: ${signUpError.message}`);
        }
        throw signUpError;
      }
      
      if (signUpData.user) {
        toast.success("Account created successfully! Please login to continue.");
        // Changed behavior: Instead of redirecting to shop registration immediately,
        // redirect to login tab after successful signup
        setActiveTab("login");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (!error.message.includes("User already registered")) {
        toast.error(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
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
                Access your vendor dashboard to manage your shop
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
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input 
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
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
                    
                    <div className="text-sm text-center mt-4 text-muted-foreground">
                      <p>Food Court Vendors:</p>
                      <p>GREENZY: greenzy@campus.com / green123</p>
                      <p>Main Food Court: main@campus.com / main123</p>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input 
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-vendor-600 hover:bg-vendor-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
            
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-xs text-gray-500 mt-4">
                <p>Enter your email address and password to manage your campus shop.</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorLogin;
