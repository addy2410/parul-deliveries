
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "./types";
import { OrderStatusIndicator, getStatusIcon } from "./OrderStatusIndicator";
import { getNextStatus } from "./types";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  return (
    <Card key={order.id} className="border border-border/40">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium">
              Order #{order.id.slice(0, 8)}... 
            </h4>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <OrderStatusIndicator status={order.status} />
        </div>
        
        <div className="mb-2">
          <p className="text-sm">
            <strong>Customer:</strong> {order.student_name}
          </p>
          <p className="text-sm">
            <strong>Delivery:</strong> {order.delivery_location}
          </p>
          {order.estimated_delivery_time && (
            <p className="text-sm">
              <strong>Estimated time:</strong> {order.estimated_delivery_time}
            </p>
          )}
        </div>
        
        <div className="border-t border-border/40 pt-2 mb-3">
          <p className="text-sm font-medium mb-1">Items:</p>
          <ul className="text-sm space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.quantity * item.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/40 pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          {order.status !== 'cancelled' && (
            <Button
              className="bg-vendor-600 hover:bg-vendor-700"
              onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
            >
              {getStatusIcon(getNextStatus(order.status))}
              <span className="ml-2">
                Mark as {getNextStatus(order.status).charAt(0).toUpperCase() + 
                         getNextStatus(order.status).slice(1)}
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
