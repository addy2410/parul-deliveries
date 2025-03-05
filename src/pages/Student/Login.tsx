
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentLogin = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkStudentSession = async () => {
      const studentSession = localStorage.getItem('studentSession');
      if (studentSession) {
        const { userId, name } = JSON.parse(studentSession);
        if (userId && name) {
          navigate('/student/restaurants');
        }
      }
    };
    
    checkStudentSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-student-password', {
        body: { email: loginEmail, password: loginPassword }
      });
      
      if (error || !data.success) {
        console.error("Login error:", error || data.error);
        toast.error(data?.error || "Login failed. Please check your credentials.");
        return;
      }
      
      // Store user session
      localStorage.setItem('studentSession', JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: loginEmail,
      }));
      
      toast.success("Login successful!");
      navigate('/student/restaurants');
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Name, email, and password are required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-student-user', {
        body: { 
          name: registerName, 
          email: registerEmail, 
          password: registerPassword
        }
      });
      
      if (error || !data.success) {
        console.error("Registration error:", error || data.error);
        toast.error(data?.error || "Registration failed. Please try again.");
        return;
      }
      
      // Store user session
      localStorage.setItem('studentSession', JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: registerEmail,
      }));
      
      toast.success("Registration successful!");
      navigate('/student/restaurants');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">CampusGrub Food Delivery</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Student Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="register-name" className="text-sm font-medium">Name</label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-email" className="text-sm font-medium">Email</label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6">
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
