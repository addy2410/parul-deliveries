
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import OrderCard from "./vendor/OrderCard";
import { useOrdersData } from "./vendor/useOrdersData";

interface VendorOrdersListProps {
  vendorId: string;
  shopId?: string;
  onOrderUpdate?: () => void;
  onOrderDelivered?: () => void;
}

const VendorOrdersList: React.FC<VendorOrdersListProps> = ({ 
  vendorId, 
  shopId,
  onOrderUpdate,
  onOrderDelivered
}) => {
  const { 
    orders, 
    loading, 
    updateOrderStatus 
  } = useOrdersData({
    vendorId,
    shopId,
    onOrderUpdate,
    onOrderDelivered
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Active Orders
          {orders.length > 0 && (
            <Badge className="ml-2 bg-blue-500">{orders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={updateOrderStatus} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No active orders at the moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOrdersList;
