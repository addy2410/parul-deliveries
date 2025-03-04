
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase, isUsingDefaultCredentials } from "@/lib/supabase";
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

const StudentLogin = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
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
      if (isUsingDefaultCredentials()) {
        // In demo mode, check if the user exists in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
        const user = storedUsers.find((u: any) => u.phone === values.phone && u.password === values.password);
        
        if (user) {
          localStorage.setItem('currentStudentId', user.id);
          localStorage.setItem('studentName', user.name);
          localStorage.setItem('studentPhone', user.phone);
          
          toast.success("Login successful!");
          navigate("/student/restaurants");
        } else {
          toast.error("Invalid phone number or password");
        }
      } else {
        // In production, use Supabase
        const { data, error } = await supabase
          .from('student_users')
          .select('id, name, phone')
          .eq('phone', values.phone)
          .eq('password_hash', values.password) // In a real app, we'd use proper password hashing
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Store user info in session
          await supabase.auth.signInWithPassword({
            email: `${values.phone}@campusgrub.app`, // Create a pseudo email for Supabase auth
            password: values.password,
          });
          
          localStorage.setItem('currentStudentId', data.id);
          localStorage.setItem('studentName', data.name);
          localStorage.setItem('studentPhone', data.phone);
          
          toast.success("Login successful!");
          navigate("/student/restaurants");
        } else {
          toast.error("Invalid phone number or password");
        }
      }
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
      if (isUsingDefaultCredentials()) {
        // In demo mode, store user in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('studentUsers') || '[]');
        
        // Check if phone number already exists
        const userExists = storedUsers.some((u: any) => u.phone === values.phone);
        
        if (userExists) {
          toast.error("An account with this phone number already exists");
          return;
        }
        
        // Create new user
        const newUser = {
          id: `student-${Date.now()}`,
          phone: values.phone,
          name: values.name,
          password: values.password,
          createdAt: new Date().toISOString(),
        };
        
        // Save to localStorage
        storedUsers.push(newUser);
        localStorage.setItem('studentUsers', JSON.stringify(storedUsers));
        
        // Login the user
        localStorage.setItem('currentStudentId', newUser.id);
        localStorage.setItem('studentName', newUser.name);
        localStorage.setItem('studentPhone', newUser.phone);
        
        toast.success("Registration successful!");
        navigate("/student/restaurants");
      } else {
        // In production, use Supabase
        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('student_users')
          .select('id')
          .eq('phone', values.phone)
          .maybeSingle();
          
        if (checkError) {
          throw checkError;
        }
        
        if (existingUser) {
          toast.error("An account with this phone number already exists");
          return;
        }
        
        // Create auth user first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${values.phone}@campusgrub.app`, // Create a pseudo email for Supabase auth
          password: values.password,
        });
        
        if (authError) {
          throw authError;
        }
        
        // Insert into student_users table
        const { data, error } = await supabase
          .from('student_users')
          .insert([{
            id: authData.user!.id,
            phone: values.phone,
            name: values.name,
            password_hash: values.password, // In a real app, we'd use proper password hashing
          }])
          .select();
          
        if (error) {
          throw error;
        }
        
        // Store user info in localStorage
        localStorage.setItem('currentStudentId', authData.user!.id);
        localStorage.setItem('studentName', values.name);
        localStorage.setItem('studentPhone', values.phone);
        
        toast.success("Registration successful!");
        navigate("/student/restaurants");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
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
              {isRegistering 
                ? "Create an account to order food" 
                : "Login to order food from campus restaurants"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isRegistering ? (
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
            ) : (
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
                    {isLoading ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={isLoading}
            >
              {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
            </Button>
            
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
