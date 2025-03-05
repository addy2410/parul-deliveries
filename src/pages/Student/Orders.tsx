
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { sampleOrders, Order } from "@/data/data";
import OrderCard from "@/components/OrderCard";
import StudentHeader from "@/components/StudentHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const StudentOrders = () => {
  const { type } = useParams<{ type: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [studentName] = useState("John Doe"); // In a real app, this would come from authentication
  
  useEffect(() => {
    // In a demo mode, we're using sample orders
    // Filter orders based on status and simulate they belong to this student
    const activeOrders = sampleOrders.filter(
      order => !['delivered', 'cancelled'].includes(order.status)
    );
    
    const previousOrders = sampleOrders.filter(
      order => ['delivered', 'cancelled'].includes(order.status)
    );
    
    if (type === 'active') {
      setOrders(activeOrders);
    } else {
      setOrders(previousOrders);
    }
  }, [type]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader studentName={studentName} />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/restaurants" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">
          {type === 'active' ? 'Active Orders' : 'Order History'}
        </h1>
        
        <Tabs defaultValue={type} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger 
              value="active" 
              asChild
            >
              <Link to="/student/orders/active">Active Orders</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="previous"
              asChild
            >
              <Link to="/student/orders/previous">Order History</Link>
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {orders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    isVendor={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-center text-muted-foreground">
                    {type === 'active' 
                      ? "You don't have any active orders."
                      : "You don't have any previous orders."
                    }
                  </p>
                  <Button 
                    className="mt-4 bg-[#ea384c] hover:bg-[#d02e40]"
                    asChild
                  >
                    <Link to="/student/restaurants">Order Food Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentOrders;
