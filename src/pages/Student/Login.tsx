
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const StudentLogin = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkStudentSession = async () => {
      const studentSession = localStorage.getItem('studentSession');
      if (studentSession) {
        try {
          const { userId, name } = JSON.parse(studentSession);
          if (userId && name) {
            navigate('/student/restaurants');
          }
        } catch (error) {
          console.error("Invalid session data", error);
          localStorage.removeItem('studentSession');
        }
      }
    };
    
    checkStudentSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter your email and password");
      toast.error("Please enter your email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", loginEmail);
      
      // Show a persistent toast while login is in progress
      const pendingToast = toast.loading("Logging in...");
      
      // Call the edge function with proper error handling
      const response = await supabase.functions.invoke('verify-student-password', {
        body: { email: loginEmail, password: loginPassword }
      });
      
      // Dismiss the loading toast
      toast.dismiss(pendingToast);
      
      console.log("Login response:", response);
      
      if (response.error) {
        console.error("Login error from function invocation:", response.error);
        setErrorMessage(response.error.message || "Login failed. Please try again.");
        toast.error(response.error.message || "Login failed. Please try again.");
        return;
      }
      
      const { data } = response;
      
      if (!data || !data.success) {
        console.error("Login failed:", data?.error);
        setErrorMessage(data?.error || "Login failed. Please check your credentials.");
        toast.error(data?.error || "Login failed. Please check your credentials.");
        return;
      }
      
      // Store user session
      const sessionData = {
        userId: data.userId,
        name: data.name,
        email: loginEmail,
      };
      
      localStorage.setItem('studentSession', JSON.stringify(sessionData));
      
      toast.success("Login successful!");
      navigate('/student/restaurants');
      
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!registerName || !registerEmail || !registerPassword) {
      setErrorMessage("Name, email, and password are required");
      toast.error("Name, email, and password are required");
      return;
    }
    
    if (registerPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting registration with email:", registerEmail);
      
      // Show a persistent toast while registration is in progress
      const pendingToast = toast.loading("Creating your account...");
      
      // Call the edge function with proper error handling
      const response = await supabase.functions.invoke('create-student-user', {
        body: { 
          name: registerName, 
          email: registerEmail, 
          password: registerPassword
        }
      });
      
      // Dismiss the loading toast
      toast.dismiss(pendingToast);
      
      console.log("Registration complete. Full response:", response);
      
      // Check for error in the response object itself (network/invocation error)
      if (response.error) {
        console.error("Registration error from function invocation:", response.error);
        setErrorMessage(`Registration failed: ${response.error.message || "Unknown error"}`);
        toast.error(`Registration failed: ${response.error.message || "Unknown error"}`);
        return;
      }
      
      const { data } = response;
      
      // Check for error in the data (logical error from the function)
      if (!data || !data.success) {
        console.error("Registration failed with data:", data);
        setErrorMessage(data?.error || "Registration failed. Please try again.");
        toast.error(data?.error || "Registration failed. Please try again.");
        return;
      }
      
      // Store user session
      console.log("Creating session with data:", data);
      const sessionData = {
        userId: data.userId,
        name: data.name,
        email: registerEmail,
      };
      
      localStorage.setItem('studentSession', JSON.stringify(sessionData));
      
      toast.success("Registration successful!");
      navigate('/student/restaurants');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(`Registration error: ${error.message || "Unknown error"}`);
      toast.error(`Registration error: ${error.message || "Unknown error"}`);
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
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("register")}
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("login")}
                      disabled={isLoading}
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
