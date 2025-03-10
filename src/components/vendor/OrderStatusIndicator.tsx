
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Package, Truck, CheckCircle, ShoppingBag } from "lucide-react";
import { OrderStatus } from "./types";

interface OrderStatusIndicatorProps {
  status: string;
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
    case 'preparing': return <ChefHat className="h-5 w-5 text-blue-500" />;
    case 'ready': return <Package className="h-5 w-5 text-purple-500" />;
    case 'delivering': return <Truck className="h-5 w-5 text-orange-500" />;
    case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
    default: return <ShoppingBag className="h-5 w-5 text-gray-500" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'preparing': return 'bg-blue-500';
    case 'ready': return 'bg-purple-500';
    case 'delivering': return 'bg-orange-500';
    case 'delivered': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const OrderStatusIndicator: React.FC<OrderStatusIndicatorProps> = ({ status }) => {
  return (
    <Badge className={`${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
