
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { isUsingDefaultCredentials } from "@/lib/supabase";
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
  
  const handleCardClick = () => {
    // Always navigate, even with default credentials - just show a toast warning
    if (isUsingDefaultCredentials()) {
      toast.warning("Using demo mode with sample data. Set up Supabase for full functionality.");
      console.log("Using demo mode with sample data");
    }
    navigate(route);
  };
  
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
        onClick={handleCardClick}
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
  // Show a demo mode message on component mount
  React.useEffect(() => {
    if (isUsingDefaultCredentials()) {
      toast.info("Demo mode active: Using sample data since Supabase is not configured.", {
        duration: 5000,
      });
      console.log("Demo mode active: Using sample data");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <RoleCard
        title="I'm a Vendor"
        description="Manage your menu, accept orders, and track deliveries."
        route="/vendor/login"
        className="border-primary hover:border-primary/80"
        delay={0.2}
      />
      <RoleCard
        title="I'm a Student"
        description="Browse restaurants, order food, and enjoy campus delivery."
        route="/student/restaurants"
        className="border-secondary hover:border-secondary/80"
        delay={0.4}
      />
    </div>
  );
};

export default RoleSelection;
