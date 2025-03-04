
import React from 'react';

interface CampusGrubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CampusGrubLogo: React.FC<CampusGrubLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  return (
    <div className={`font-extrabold text-[#ea384c] ${sizeClasses[size]} ${className}`}>
      CampusGrub
    </div>
  );
};

export default CampusGrubLogo;
