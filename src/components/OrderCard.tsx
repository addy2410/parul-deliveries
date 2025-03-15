
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Order } from "@/components/vendor/types";

interface OrderCardProps {
  order: Order;
  isVendor?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => Promise<boolean>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isVendor = false, onStatusChange }) => {
  // Local state to prevent UI jitter during status updates
  const [localStatus, setLocalStatus] = useState<string>(order.status);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // When order prop changes, update local state if needed (but not during an active update)
  React.useEffect(() => {
    if (!isUpdating) {
      setLocalStatus(order.status);
    }
  }, [order.status, isUpdating]);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'prepared': return 'bg-purple-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getNextStatus = (currentStatus: string) => {
    switch(currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'prepared';
      case 'prepared': return 'delivering';
      case 'delivering': return 'delivered';
      default: return currentStatus;
    }
  };
  
  const handleNextStatus = async () => {
    if (isVendor && localStatus !== 'delivered' && localStatus !== 'cancelled' && !isUpdating) {
      const nextStatus = getNextStatus(localStatus);
      
      try {
        // Set updating flag and update local state immediately for a responsive UI
        setIsUpdating(true);
        setLocalStatus(nextStatus);
        
        if (onStatusChange) {
          // Use the callback if provided
          const success = await onStatusChange(order.id, nextStatus);
          if (!success) {
            // Revert on failure
            setLocalStatus(order.status);
            toast.error(`Failed to update order to ${nextStatus}`);
          }
        } else {
          // Default implementation if no callback is provided
          console.log("Updating order status to:", nextStatus);
          
          // First update in database
          const { error } = await supabase
            .from('orders')
            .update({ status: nextStatus })
            .eq('id', order.id);
            
          if (error) {
            // Revert on failure
            setLocalStatus(order.status);
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
          } else {
            toast.success(`Order updated to ${nextStatus}`);
          }
        }
      } catch (error) {
        // Revert on exception
        setLocalStatus(order.status);
        console.error("Error in handleNextStatus:", error);
        toast.error("An error occurred while updating order status");
      } finally {
        // Give a small delay before allowing new updates to prevent rapid clicking
        setTimeout(() => {
          setIsUpdating(false);
        }, 500);
      }
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
              <h3 className="text-lg font-medium">
                Order #{order.id.slice(0, 8)}
                {order.restaurantName && !isVendor && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {order.restaurantName}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge className={`${getStatusColor(localStatus)} capitalize`}>
              {localStatus}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div>
              {isVendor && (
                <p className="text-sm font-medium mb-2">
                  Customer: {order.student_name}
                </p>
              )}
              
              <div className="flex items-start text-sm mb-2">
                <MapPin size={16} className="mr-1 mt-1 flex-shrink-0" />
                <span>{order.delivery_location}</span>
              </div>
              
              {order.estimated_delivery_time && (
                <div className="flex items-center text-sm">
                  <Clock size={16} className="mr-1 flex-shrink-0" />
                  <span>{order.estimated_delivery_time}</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Items:</p>
              <ul className="space-y-1 text-sm">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
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
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        {isVendor && localStatus !== 'delivered' && localStatus !== 'cancelled' ? (
          <CardFooter className="pt-2">
            <Button 
              onClick={handleNextStatus} 
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : `Mark as ${getNextStatus(localStatus).replace(/^\w/, c => c.toUpperCase())}`}
            </Button>
          </CardFooter>
        ) : !isVendor ? (
          <CardFooter className="pt-2 flex gap-2">
            {localStatus !== 'delivered' && localStatus !== 'cancelled' ? (
              <Button 
                asChild
                className="flex-1 bg-[#ea384c] hover:bg-[#d02e40]"
              >
                <Link to={`/student/order-tracking/${order.id}`} className="flex items-center justify-center gap-2">
                  <ExternalLink size={16} />
                  Track Order
                </Link>
              </Button>
            ) : null}
            <Button 
              asChild
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Link to={`/student/view-order/${order.id}`} className="flex items-center justify-center gap-2">
                View Details
              </Link>
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </motion.div>
  );
};

export default OrderCard;
