
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { 
  supabase, 
  updateOrderStatus, 
  getNextOrderStatus 
} from "@/lib/supabase";
import { toast } from "sonner";

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  student_id: string;
  vendor_id: string;
  shop_id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
  restaurantName?: string;
  customerName?: string;
}

interface OrderCardProps {
  order: Order;
  isVendor?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => Promise<boolean>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isVendor = false, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
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
  
  const handleNextStatus = async () => {
    if (isVendor && order.status !== 'delivered' && order.status !== 'cancelled') {
      const nextStatus = getNextOrderStatus(order.status);
      
      try {
        setIsUpdating(true);
        
        if (onStatusChange) {
          // Use the callback if provided
          const success = await onStatusChange(order.id, nextStatus);
          if (!success) {
            toast.error(`Failed to update order to ${nextStatus}`);
          }
        } else {
          // Default implementation using the utility function
          const result = await updateOrderStatus(order.id, nextStatus);
          
          if (!result.success) {
            console.error("Error updating order status:", result.error);
            toast.error("Failed to update order status");
            return;
          }
        }
      } catch (error) {
        console.error("Error in handleNextStatus:", error);
        toast.error("An error occurred while updating order status");
      } finally {
        setIsUpdating(false);
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
        
        {isVendor && order.status !== 'delivered' && order.status !== 'cancelled' ? (
          <CardFooter className="pt-2">
            <Button 
              onClick={handleNextStatus} 
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Mark as ${getNextOrderStatus(order.status).replace(/^\w/, c => c.toUpperCase())}`
              )}
            </Button>
          </CardFooter>
        ) : !isVendor ? (
          <CardFooter className="pt-2 flex gap-2">
            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
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
