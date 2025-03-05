
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify this is a student user by checking student_profiles
        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('id, name')
          .eq('id', session.user.id)
          .single();
          
        if (studentProfile) {
          // This is a student, store session info and redirect
          const sessionData = {
            userId: session.user.id,
            name: studentProfile.name,
            email: session.user.email,
          };
          localStorage.setItem('studentSession', JSON.stringify(sessionData));
          navigate('/student/restaurants');
        } else {
          // Not a student, sign out
          await supabase.auth.signOut();
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
      const pendingToast = toast.loading("Logging in...");
      
      // Use Supabase Auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      toast.dismiss(pendingToast);
      
      if (error) {
        console.error("Login error:", error);
        setErrorMessage(error.message || "Login failed. Please check your credentials.");
        toast.error(error.message || "Login failed. Please check your credentials.");
        return;
      }
      
      if (!data || !data.user) {
        console.error("Login failed: No user data returned");
        setErrorMessage("Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");
        return;
      }
      
      // Verify this is a student user by checking student_profiles
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, name')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !studentProfile) {
        console.error("This account is not registered as a student:", profileError);
        // Sign out since this is not a student account
        await supabase.auth.signOut();
        setErrorMessage("This account is not registered as a student.");
        toast.error("This account is not registered as a student.");
        return;
      }
      
      // Store user session
      const sessionData = {
        userId: data.user.id,
        name: studentProfile.name,
        email: data.user.email,
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
      const pendingToast = toast.loading("Creating your account...");
      
      console.log("Submitting registration data:", { 
        name: registerName, 
        email: registerEmail, 
        password: registerPassword.length // Just log the length for security
      });
      
      // First check if this user is already registered as a vendor
      const { data: existingVendors, error: vendorCheckError } = await supabase
        .from('vendors')
        .select('id')
        .eq('email', registerEmail)
        .limit(1);
        
      if (vendorCheckError) {
        console.error("Error checking for existing vendor:", vendorCheckError);
        toast.dismiss(pendingToast);
        setErrorMessage("Error checking account. Please try again.");
        toast.error("Error checking account. Please try again.");
        return;
      }
      
      if (existingVendors && existingVendors.length > 0) {
        console.error("Email already registered as vendor");
        toast.dismiss(pendingToast);
        setErrorMessage("Email already registered as a vendor.");
        toast.error("Email already registered as a vendor.");
        return;
      }
      
      // Use Supabase Auth to create the user
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            name: registerName,
            user_type: 'student'
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        toast.dismiss(pendingToast);
        setErrorMessage(error.message || "Registration failed. Please try again.");
        toast.error(error.message || "Registration failed. Please try again.");
        return;
      }
      
      if (!data || !data.user) {
        console.error("Registration failed: No user data returned");
        toast.dismiss(pendingToast);
        setErrorMessage("Registration failed. Please try again.");
        toast.error("Registration failed. Please try again.");
        return;
      }
      
      toast.dismiss(pendingToast);
      
      // Wait for a moment to allow the trigger to create the student profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if student profile was created
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, name')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !studentProfile) {
        console.error("Error verifying student profile:", profileError);
        toast.warning("Account created, but student profile setup may be delayed. Please try logging in again in a few moments.");
      } else {
        // Store user session
        const sessionData = {
          userId: data.user.id,
          name: registerName,
          email: registerEmail,
        };
        
        localStorage.setItem('studentSession', JSON.stringify(sessionData));
        toast.success("Registration successful!");
        navigate('/student/restaurants');
      }
      
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
