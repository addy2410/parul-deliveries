
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStudentAuth } from "@/hooks/useStudentAuth";

type AuthContextType = {
  user: any;
  studentName: string | null;
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    studentId, 
    studentName, 
    loading, 
    isAuthenticated 
  } = useStudentAuth();

  return (
    <AuthContext.Provider value={{
      user: studentId ? { id: studentId } : null,
      studentName,
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
