
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/data/data";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface OrderCardProps {
  order: Order;
  isVendor?: boolean;
  onStatusChange?: (orderId: string, newStatus: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isVendor = false, onStatusChange }) => {
  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getNextStatus = (currentStatus: Order['status']) => {
    switch(currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivering';
      case 'delivering': return 'delivered';
      default: return currentStatus;
    }
  };
  
  const handleNextStatus = () => {
    if (onStatusChange && order.status !== 'delivered' && order.status !== 'cancelled') {
      onStatusChange(order.id, getNextStatus(order.status));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border border-border/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Order #{order.id.split('-')[1]}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} capitalize`}>
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div>
              {isVendor && (
                <p className="text-sm font-medium mb-2">
                  Customer: {order.customerName}
                </p>
              )}
              
              <div className="flex items-start text-sm mb-2">
                <MapPin size={16} className="mr-1 mt-1 flex-shrink-0" />
                <span>{order.deliveryLocation}</span>
              </div>
              
              {order.estimatedDeliveryTime && (
                <div className="flex items-center text-sm">
                  <Clock size={16} className="mr-1 flex-shrink-0" />
                  <span>{order.estimatedDeliveryTime}</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Items:</p>
              <ul className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.menuItemId} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        {isVendor && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <CardFooter className="pt-2">
            <Button 
              onClick={handleNextStatus} 
              className="w-full"
            >
              Mark as {getNextStatus(order.status).replace(/^\w/, c => c.toUpperCase())}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default OrderCard;
