
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { isUsingDefaultCredentials } from "@/lib/supabase";
import { toast } from "sonner";
import { User, ChefHat, ArrowRight } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  route: string;
  className: string;
  delay: number;
  icon: React.ReactNode;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, description, route, className, delay, icon }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Always navigate, even with default credentials - just show a toast warning
    if (isUsingDefaultCredentials()) {
      toast.info("Using demo mode with sample data. Set up Supabase for full functionality.");
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
        className={`cursor-pointer overflow-hidden ${className} shadow-lg border-2 hover:shadow-xl transition-all duration-300 group`}
        onClick={handleCardClick}
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-opacity-10 mr-3 text-primary">
              {icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-5">{description}</p>
          
          <div className="flex justify-end mt-2">
            <motion.div 
              className="flex items-center text-primary text-sm font-medium"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4 inline-block group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </div>
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
    <div className="flex flex-col items-center space-y-6">
      {/* Add the CampusGrub logo */}
      <div className="text-4xl font-bold fontLogo mb-4">
        <span className="text-[#ea384c]">Campus</span><span className="text-black">Grub</span>
      </div>
      
      <motion.h2 
        className="text-2xl md:text-3xl font-semibold text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        How would you like to proceed?
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto w-full">
        <RoleCard
          title="I'm a Vendor"
          description="Manage your menu, accept orders, and track deliveries."
          route="/vendor/login"
          className="border-primary/50 hover:border-primary bg-gradient-to-b from-white to-red-50"
          delay={0.2}
          icon={<ChefHat className="h-6 w-6 text-primary" />}
        />
        <RoleCard
          title="I'm a Student"
          description="Browse restaurants, order food, and enjoy campus delivery."
          route="/student/restaurants"
          className="border-secondary/80 hover:border-secondary bg-gradient-to-b from-white to-orange-50"
          delay={0.4}
          icon={<User className="h-6 w-6 text-secondary-foreground" />}
        />
      </div>
    </div>
  );
};

export default RoleSelection;
