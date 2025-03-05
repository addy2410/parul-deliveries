
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Bell, CheckCircle, XCircle } from "lucide-react";

interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface Order {
  id: string;
  student_id: string;
  vendor_id: string;
  restaurant_id: string;
  items: any[];
  total_amount: number;
  status: string;
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
}

interface VendorNotificationsProps {
  vendorId: string;
  onOrderStatusChange?: () => void;
}

const VendorNotifications: React.FC<VendorNotificationsProps> = ({ vendorId, onOrderStatusChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch notifications
  useEffect(() => {
    if (!vendorId) return;
    
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', vendorId)
          .eq('is_read', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching notifications:", error);
          return;
        }
        
        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${vendorId}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        toast.info("New notification received");
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      // First, find the delivery time estimate based on order items
      // In a real app, this might be calculated based on the number/type of items
      const estimatedTime = Math.floor(Math.random() * 20) + 15; // 15-35 minutes
      const estimatedDeliveryTime = `${estimatedTime} minutes`;
      
      // Update order status to 'preparing'
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'preparing',
          estimated_delivery_time: estimatedDeliveryTime
        })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error accepting order:", error);
        toast.error("Failed to accept order");
        return;
      }
      
      // Mark notification as read
      const notif = notifications.find(n => n.data?.order_id === orderId);
      if (notif) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notif.id);
          
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }
      
      toast.success("Order accepted and moved to preparation");
      if (onOrderStatusChange) onOrderStatusChange();
      
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("An error occurred while accepting the order");
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      // Update order status to 'cancelled'
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          estimated_delivery_time: 'Order cancelled'
        })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error declining order:", error);
        toast.error("Failed to decline order");
        return;
      }
      
      // Mark notification as read
      const notif = notifications.find(n => n.data?.order_id === orderId);
      if (notif) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notif.id);
          
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }
      
      toast.success("Order has been declined");
      if (onOrderStatusChange) onOrderStatusChange();
      
    } catch (error) {
      console.error("Error declining order:", error);
      toast.error("An error occurred while declining the order");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Render order notification item
  const renderOrderNotification = (notification: Notification) => {
    const { data } = notification;
    const orderItems = data?.items || [];
    const formattedItems = Array.isArray(orderItems) 
      ? orderItems.map((item: any) => `${item.quantity}x ${item.name}`).join(", ")
      : "Items not available";
    
    return (
      <div className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium">{notification.message}</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
          <Badge className="bg-orange-500">New Order</Badge>
        </div>
        
        <div className="text-sm mb-3">
          <p><strong>Total:</strong> ₹{data?.total_amount}</p>
          <p><strong>Items:</strong> {formattedItems}</p>
          <p><strong>Delivery Location:</strong> {data?.delivery_location || "Not specified"}</p>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeclineOrder(data?.order_id)}
          >
            <XCircle size={16} className="mr-1" /> Decline
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            size="sm"
            onClick={() => handleAcceptOrder(data?.order_id)}
          >
            <CheckCircle size={16} className="mr-1" /> Accept
          </Button>
        </div>
      </div>
    );
  };

  // Render other notifications
  const renderOtherNotification = (notification: Notification) => {
    return (
      <div className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium">{notification.message}</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
          <Badge>{notification.type}</Badge>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleMarkAsRead(notification.id)}
          >
            Mark as Read
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications 
          {notifications.length > 0 && (
            <Badge className="ml-2 bg-red-500">{notifications.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map(notification => (
              <div key={notification.id}>
                {notification.type === 'new_order' 
                  ? renderOrderNotification(notification)
                  : renderOtherNotification(notification)
                }
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No new notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorNotifications;
