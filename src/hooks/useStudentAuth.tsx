
import { useState, useEffect } from 'react';

interface StudentSession {
  userId: string;
  name: string;
  email: string;
  address?: string;
}

export function useStudentAuth() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentAddress, setStudentAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored session
    const studentSession = localStorage.getItem('studentSession');
    if (studentSession) {
      try {
        const { userId, name, email, address } = JSON.parse(studentSession) as StudentSession;
        setStudentId(userId);
        setStudentName(name);
        setStudentEmail(email);
        setStudentAddress(address || null);
        setIsAuthenticated(true);
        console.log("Student auth hook: User is authenticated with ID:", userId);
      } catch (error) {
        console.error("Error parsing student session:", error);
        // Clear invalid session data
        localStorage.removeItem('studentSession');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      console.log("Student auth hook: No session found");
    }
    setLoading(false);
  }, []);

  const updateStudentAddress = (address: string) => {
    setStudentAddress(address);
    
    // Update the address in localStorage
    const studentSession = localStorage.getItem('studentSession');
    if (studentSession) {
      try {
        const session = JSON.parse(studentSession) as StudentSession;
        session.address = address;
        localStorage.setItem('studentSession', JSON.stringify(session));
      } catch (error) {
        console.error("Error updating student address:", error);
      }
    }
  };

  const login = (userData: StudentSession) => {
    localStorage.setItem('studentSession', JSON.stringify(userData));
    setStudentId(userData.userId);
    setStudentName(userData.name);
    setStudentEmail(userData.email);
    setStudentAddress(userData.address || null);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('studentSession');
    setStudentId(null);
    setStudentName(null);
    setStudentEmail(null);
    setStudentAddress(null);
    setIsAuthenticated(false);
  };

  return {
    studentId,
    studentName,
    studentEmail,
    studentAddress,
    loading,
    isAuthenticated,
    updateStudentAddress,
    login,
    logout
  };
}
