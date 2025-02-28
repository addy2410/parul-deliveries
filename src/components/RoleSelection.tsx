
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface RoleCardProps {
  title: string;
  description: string;
  route: string;
  className: string;
  delay: number;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, description, route, className, delay }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden ${className} shadow-lg border-2 hover:shadow-xl transition-all duration-300`}
        onClick={() => navigate(route)}
      >
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RoleSelection: React.FC = () => {
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('health_check').select('*').limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error);
          toast.error("Failed to connect to Supabase");
        } else {
          console.log("Successfully connected to Supabase");
          toast.success("Connected to Supabase");
        }
      } catch (error) {
        console.error("Error checking Supabase connection:", error);
        toast.error("Error connecting to Supabase");
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <RoleCard
        title="I'm a Vendor"
        description="Manage your menu, accept orders, and track deliveries."
        route="/vendor/login"
        className="border-vendor-500 hover:border-vendor-700"
        delay={0.2}
      />
      <RoleCard
        title="I'm a Student"
        description="Browse restaurants, order food, and enjoy campus delivery."
        route="/student/restaurants"
        className="border-student-500 hover:border-student-700"
        delay={0.4}
      />
    </div>
  );
};

export default RoleSelection;
