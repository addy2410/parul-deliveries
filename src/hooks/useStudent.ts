
import { useState, useEffect } from 'react';
import { getCurrentStudent, logoutStudent } from '@/lib/auth';
import { StudentUser } from '@/data/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useStudent(redirectIfNotAuthenticated = false) {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const currentStudent = await getCurrentStudent();
        
        setStudent(currentStudent);
        
        if (!currentStudent && redirectIfNotAuthenticated) {
          navigate('/student/auth');
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        if (redirectIfNotAuthenticated) {
          navigate('/student/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [navigate, redirectIfNotAuthenticated]);

  const logout = async () => {
    try {
      const success = await logoutStudent();
      if (success) {
        setStudent(null);
        toast.success('Logged out successfully');
        navigate('/');
      } else {
        toast.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('An error occurred while logging out');
    }
  };

  return { student, loading, logout };
}
