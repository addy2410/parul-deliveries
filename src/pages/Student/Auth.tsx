
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Create schema for login
const loginSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Create schema for registration
const registerSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const StudentAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      name: "",
      password: "",
    },
  });
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if the user exists in the database
      const { data, error } = await supabase
        .from('student_users')
        .select('id, name, phone, password_hash')
        .eq('phone', values.phone)
        .single();
        
      if (error) {
        toast.error("Invalid phone number or password");
        return;
      }
      
      // Check if password matches
      if (data.password_hash !== values.password) {
        toast.error("Invalid phone number or password");
        return;
      }
      
      // Store user info in localStorage
      localStorage.setItem('currentStudentId', data.id);
      localStorage.setItem('studentName', data.name);
      localStorage.setItem('studentPhone', data.phone);
      
      toast.success("Login successful!");
      navigate("/student/restaurants");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('student_users')
        .select('id')
        .eq('phone', values.phone)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingUser) {
        toast.error("An account with this phone number already exists. Please login instead.");
        return;
      }
      
      // Create new user
      const user_id = `student-${Date.now()}`;
      
      // Insert into student_users table
      const { data, error } = await supabase
        .from('student_users')
        .insert([{
          id: user_id,
          phone: values.phone,
          name: values.name,
          password_hash: values.password,
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Store user info in localStorage
      localStorage.setItem('currentStudentId', user_id);
      localStorage.setItem('studentName', values.name);
      localStorage.setItem('studentPhone', values.phone);
      
      toast.success("Registration successful!");
      navigate("/student/restaurants");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center p-4">
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
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl fontLogo">Campus<span className="text-[#ea384c]">Grub</span></CardTitle>
              <CardDescription>
                Login or sign up to order food from campus restaurants
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-4 pt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your phone number" 
                              type="tel"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your password" 
                              type="password"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup" className="p-4 pt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your phone number" 
                              type="tel"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a password" 
                              type="password"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex flex-col">
              <p className="text-sm text-center text-muted-foreground mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentAuth;
