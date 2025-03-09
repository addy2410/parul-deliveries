
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
  pattern: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, description, route, className, delay, icon, pattern }) => {
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
        className={`cursor-pointer overflow-hidden ${className} shadow-lg border-2 hover:shadow-xl transition-all duration-300 group relative`}
        onClick={handleCardClick}
        style={{
          backgroundImage: pattern,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <CardContent className="p-6 md:p-8 relative">
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
      {/* Add the CampusGrub logo with a more vibrant presentation */}
      <div className="text-4xl font-bold fontLogo mb-4 relative">
        <motion.span
          className="text-[#ea384c] inline-block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Campus
        </motion.span>
        <motion.span
          className="text-black inline-block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Grub
        </motion.span>
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
          className="border-primary/50 hover:border-primary"
          delay={0.2}
          icon={<ChefHat className="h-6 w-6 text-primary" />}
          pattern="url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e11d48' fill-opacity='0.05'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657l1.415 1.414L13.857 0H11.03zm32.284 0l6.364 6.364-1.414 1.414L41.2 0h2.115zm-25.716 0l-6.364 6.364 1.414 1.414L19.8 0h-2.114zM30 0l-6.364 6.364 1.414 1.414L31.414 0H30zm7.07 0l-6.364 6.364 1.414 1.414L38.543 0h-1.47zM22.93 0l6.364 6.364-1.414 1.414L21.457 0h1.47zm-9.9 0l3.657 3.657-1.414 1.414L9.143 0h3.886zm8.486 0l-1.414 1.414L25.03 5.343 29.9 0h-8.384zM38.516 0l1.414 1.414-4.95 4.95L30 0h8.516zm-13.435 0l-2.83 2.83 1.415 1.414L30 0h-4.92zM34.95 0l2.83 2.83-1.414 1.414L30 0h4.95zm-9.9 0l3.658 3.66-1.415 1.412L20.35 0h4.7zm-9.897 0l9.9 9.9-1.415 1.414L8.443 0h6.712zm25.586 0l-9.9 9.9 1.415 1.414L40.9 0h-10.16zM22.726 0L32.63 9.9l1.414-1.414L23.14 0h-.414zm11.315 0L23.14 10.9l1.414 1.414L45.04 0H34.04zm-20.226 0L2.91 10.9l1.414 1.414L19.05 0h-5.234zm10.915 0l-8.485 8.485 1.414 1.414L28.94 0h-4.214zM32.52 0l8.484 8.484-1.414 1.414L30.104 0H32.52zm10.113 0l3.658 3.66-1.414 1.413-3.657-3.66h1.414zm-20.228 0l-3.66 3.66 1.415 1.413 3.66-3.66h-1.416zM54.627 0l-1.414 1.414 6.372 6.37-6.372 6.372 1.414 1.414 6.37-6.37 6.372 6.37 1.414-1.414-6.37-6.372 6.37-6.37L67.38 0l-6.372 6.37-6.373-6.37zm-16.97 0L36.235.828l1.414 1.415L40.99 0h-3.328zm-38.848 0L0 1.414l1.414 1.414L3.657 0H-1.19zm62.707 0l-1.414 1.414L63.76 5.07 60.104 0h3.657zM.51 4.242L4.163 7.9l1.414-1.414L2.924 2.83.509 4.243zM15.88 0l6.372 6.37-6.372 6.372 1.414 1.414 6.37-6.37 6.372 6.37 1.414-1.414-6.37-6.372 6.37-6.37L29.428 0l-6.372 6.37-6.373-6.37H15.88z'/%3E%3C/g%3E%3C/svg%3E\")"
        />
        <RoleCard
          title="I'm a Student"
          description="Browse restaurants, order food, and enjoy campus delivery."
          route="/student/restaurants"
          className="border-secondary/80 hover:border-secondary"
          delay={0.4}
          icon={<User className="h-6 w-6 text-secondary-foreground" />}
          pattern="url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fb923c' fill-opacity='0.1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E\")"
        />
      </div>
    </div>
  );
};

export default RoleSelection;
