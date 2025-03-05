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
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";

const VendorLogin = () => {
  const [pucampid, setPucampid] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pucampid || !password) {
      toast.error("Please enter both PUCAMPID and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, use localStorage for user storage
        const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
        
        // Check if vendor exists
        const existingVendor = storedVendors.find(
          (v: any) => v.pucampid === pucampid && v.password === password
        );
        
        if (existingVendor) {
          // Vendor exists, use existing ID
          localStorage.setItem('currentVendorId', existingVendor.id);
          toast.success("Login successful");
        } else if (pucampid.startsWith("VEN") && password.length >= 6) {
          // New vendor, create record
          const vendorId = `vendor-${Date.now()}`;
          const newVendor = { id: vendorId, pucampid, password };
          localStorage.setItem('vendors', JSON.stringify([...storedVendors, newVendor]));
          localStorage.setItem('currentVendorId', vendorId);
          toast.success("Account created and logged in");
        } else {
          throw new Error("Invalid credentials format");
        }
        
        // Check if vendor has a shop
        const shops = JSON.parse(localStorage.getItem('shops') || '[]');
        const vendorShop = shops.find((shop: any) => shop.vendor_id === localStorage.getItem('currentVendorId'));
        
        if (vendorShop) {
          localStorage.setItem('currentVendorShop', JSON.stringify(vendorShop));
          navigate("/vendor/dashboard");
        } else {
          navigate("/vendor/register-shop");
        }
      } else {
        // Real Supabase authentication for production mode
        const email = `${pucampid.toLowerCase()}@vendor.campusgrub.app`;
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          toast.error("Invalid credentials. Please check and try again.");
          throw signInError;
        } else if (signInData.user) {
          toast.success("Login successful");
          
          // Check if vendor has a shop
          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('vendor_id', signInData.user.id)
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
    
    if (!pucampid || !password) {
      toast.error("Please enter both PUCAMPID and password");
      return;
    }
    
    if (!pucampid.startsWith("VEN") || password.length < 6) {
      toast.error("PUCAMPID must start with 'VEN' and password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isUsingDefaultCredentials()) {
        // In demo mode, use localStorage for user storage
        const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
        
        // Check if vendor exists
        const existingVendor = storedVendors.find((v: any) => v.pucampid === pucampid);
        
        if (existingVendor) {
          toast.error("This PUCAMPID is already registered. Please login instead.");
          setActiveTab("login");
          setIsLoading(false);
          return;
        } else if (pucampid.startsWith("VEN") && password.length >= 6) {
          // New vendor, create record
          const vendorId = `vendor-${Date.now()}`;
          const newVendor = { id: vendorId, pucampid, password };
          localStorage.setItem('vendors', JSON.stringify([...storedVendors, newVendor]));
          localStorage.setItem('currentVendorId', vendorId);
          toast.success("Account created successfully! Redirecting to shop registration.");
          navigate("/vendor/register-shop");
        } else {
          throw new Error("Invalid credentials format");
        }
      } else {
        // Real Supabase authentication for production mode
        const email = `${pucampid.toLowerCase()}@vendor.campusgrub.app`;
        
        // Check if user already exists
        const { data: existingVendors, error: existingError } = await supabase
          .from('vendors')
          .select('pucampid')
          .eq('pucampid', pucampid);
          
        if (existingError) {
          console.error("Error checking existing vendor:", existingError);
          throw existingError;
        }
        
        if (existingVendors && existingVendors.length > 0) {
          toast.error("This PUCAMPID is already registered. Please login instead.");
          setActiveTab("login");
          setIsLoading(false);
          return;
        }
        
        // Create new user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            toast.error("This PUCAMPID is already registered. Please login instead.");
            setActiveTab("login");
          } else {
            toast.error(`Signup failed: ${signUpError.message}`);
          }
          throw signUpError;
        }
        
        if (signUpData.user) {
          // Insert vendor record in vendors table
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert([{ 
              id: signUpData.user.id, 
              pucampid: pucampid,
              email: email
            }]);
            
          if (vendorError) {
            console.error("Error creating vendor record:", vendorError);
            toast.error("Failed to create vendor profile");
            throw vendorError;
          }
          
          toast.success("Account created successfully! Redirecting to shop registration.");
          navigate("/vendor/register-shop");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
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
                
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-pucampid">PUCAMPID</Label>
                      <Input 
                        id="signup-pucampid"
                        placeholder="Enter PUCAMPID (e.g., VEN12345)"
                        value={pucampid}
                        onChange={(e) => setPucampid(e.target.value)}
                        autoComplete="username"
                      />
                      <p className="text-xs text-muted-foreground">
                        Must start with "VEN" (e.g., VEN12345)
                      </p>
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
                <p>For demonstration purposes, enter any PUCAMPID that starts with "VEN" (like VEN12345) and a password with at least 6 characters.</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorLogin;
