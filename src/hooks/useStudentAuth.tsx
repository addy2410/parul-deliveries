
import { useState, useEffect } from 'react';

interface StudentSession {
  id: string;
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

  useEffect(() => {
    // Check for stored session
    const studentSession = localStorage.getItem('studentSession');
    if (studentSession) {
      try {
        const { id, name, email, address } = JSON.parse(studentSession) as StudentSession;
        setStudentId(id);
        setStudentName(name);
        setStudentEmail(email);
        setStudentAddress(address || null);
      } catch (error) {
        console.error("Error parsing student session:", error);
        // Clear invalid session data
        localStorage.removeItem('studentSession');
      }
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

  return {
    studentId,
    studentName,
    studentEmail,
    studentAddress,
    loading,
    updateStudentAddress
  };
}
