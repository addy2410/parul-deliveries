
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import VendorLoginForm from "@/components/Vendor/VendorLoginForm";
import VendorSignupForm from "@/components/Vendor/VendorSignupForm";
import VendorAuthDemoCredentials from "@/components/Vendor/VendorAuthDemoCredentials";

const VendorAuth = () => {
  const [pucampid, setPucampid] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
                <VendorLoginForm 
                  pucampid={pucampid}
                  setPucampid={setPucampid}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="p-4 pt-0">
                <VendorSignupForm 
                  pucampid={pucampid}
                  setPucampid={setPucampid}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex flex-col space-y-2">
              <VendorAuthDemoCredentials />
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorAuth;
