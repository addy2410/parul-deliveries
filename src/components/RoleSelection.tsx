
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

// Create a CampusGrub logo component
const CampusGrubLogo = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="text-3xl font-extrabold">
      <span className="text-[#ea384c]">Campus</span>
      <span className="text-black">Grub</span>
    </div>
  </div>
);

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
        className={`cursor-pointer overflow-hidden ${className} transition-all duration-300 border-2 hover:shadow-xl`}
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
  return (
    <div className="flex flex-col items-center">
      <CampusGrubLogo />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <RoleCard
          title="I'm a Vendor"
          description="Manage your menu, accept orders, and track deliveries."
          route="/vendor/auth"
          className="border-primary/50 hover:border-primary"
          delay={0.2}
        />
        <RoleCard
          title="I'm a Student"
          description="Browse restaurants, order food, and enjoy campus delivery."
          route="/student/restaurants"
          className="border-secondary/50 hover:border-secondary"
          delay={0.4}
        />
      </div>
    </div>
  );
};

export default RoleSelection;
