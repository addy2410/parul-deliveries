
import { supabase } from "./supabase";
import * as bcrypt from "bcryptjs";
import { toast } from "sonner";
import { StudentUser } from "@/data/types";

// Helper to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Helper to verify passwords
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Student authentication
export const registerStudent = async (
  phone: string,
  name: string,
  password: string
): Promise<{ success: boolean; message: string; user?: StudentUser }> => {
  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from("student_users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: "This phone number is already registered. Please log in instead.",
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${phone}@student.campus-grub.com`, // Create email from phone
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, message: "Registration failed. Please try again." };
    }

    if (!authData.user) {
      return { success: false, message: "Registration failed. Please try again." };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert into student_users table
    const { data: userData, error: userError } = await supabase
      .from("student_users")
      .insert({
        id: authData.user.id,
        phone,
        name,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (userError) {
      console.error("User data error:", userError);
      // Clean up auth user as we couldn't insert user data
      await supabase.auth.signOut();
      return { success: false, message: "Registration failed. Please try again." };
    }

    return {
      success: true,
      message: "Registration successful!",
      user: userData as StudentUser,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed. Please try again." };
  }
};

export const loginStudent = async (
  phone: string,
  password: string
): Promise<{ success: boolean; message: string; user?: StudentUser }> => {
  try {
    // First find user in our custom table
    const { data: userData, error: userError } = await supabase
      .from("student_users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: "Phone number not found. Please register first.",
      };
    }

    // Sign in with auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${phone}@student.campus-grub.com`, // Use email format from phone
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, message: "Invalid credentials. Please try again." };
    }

    return {
      success: true,
      message: "Login successful!",
      user: userData as StudentUser,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed. Please try again." };
  }
};

export const getCurrentStudent = async (): Promise<StudentUser | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      return null;
    }
    
    const { data, error } = await supabase
      .from("student_users")
      .select("*")
      .eq("id", session.session.user.id)
      .single();
      
    if (error || !data) {
      return null;
    }
    
    return data as StudentUser;
  } catch (error) {
    console.error("Error getting current student:", error);
    return null;
  }
};

export const logoutStudent = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};
