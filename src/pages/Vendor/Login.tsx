
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const VendorLogin = () => {
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
    
    // In a real app, this would be an API call to verify credentials
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any login with proper format
      if (pucampid.startsWith("VEN") && pucampid.length >= 5 && password.length >= 6) {
        toast.success("Login successful");
        navigate("/vendor/dashboard");
      } else {
        toast.error("Invalid PUCAMPID or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
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
              <CardTitle className="text-2xl font-bold text-center">Vendor Login</CardTitle>
              <CardDescription className="text-center">
                Enter your PUCAMPID and password to access your vendor dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pucampid">PUCAMPID</Label>
                  <Input 
                    id="pucampid"
                    placeholder="Enter your PUCAMPID (e.g., VEN12345)"
                    value={pucampid}
                    onChange={(e) => setPucampid(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
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
                    id="password"
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
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Don't have a PUCAMPID yet?</p>
                <Button
                  variant="link"
                  className="text-vendor-600 p-0 h-auto"
                  onClick={() => {
                    toast.info("Registration would be handled by campus administration");
                  }}
                >
                  Contact campus administration
                </Button>
              </div>
            </CardContent>
            
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
