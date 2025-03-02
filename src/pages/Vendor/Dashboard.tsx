import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import OrderCard from "@/components/OrderCard";
import { sampleOrders, Order } from "@/data/data";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Menu, PanelLeft, PanelRight, PieChart, Settings, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const deliveringOrders = orders.filter(order => order.status === 'delivering');
  const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');
  
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    toast.success(`Order ${orderId.split('-')[1]} marked as ${newStatus}`);
  };
  
  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </Button>
          <h1 className="text-xl font-bold fontLogo">Vendor Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut size={20} />
          </Button>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-57px)] lg:h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: sidebarOpen ? 0 : -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ duration: 0.3 }}
          className={`fixed lg:static z-20 w-64 h-full bg-sidebar border-r`}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between p-2">
              <h2 className="text-xl font-bold fontLogo text-[#ea384c]">Parul Deliveries</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeft size={18} />
              </Button>
            </div>
            
            <div className="border-t my-4" />
            
            <nav className="space-y-1 flex-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/vendor/dashboard">
                  <ShoppingBag size={18} className="mr-2" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/vendor/menu">
                  <UtensilsCrossed size={18} className="mr-2" />
                  Menu Management
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <PieChart size={18} className="mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start" disabled>
                <Settings size={18} className="mr-2" />
                Settings
              </Button>
            </nav>
            
            <Button onClick={handleLogout} variant="outline" className="mt-auto">
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </motion.aside>
        
        {/* Main content */}
        <main className={`flex-1 p-4 lg:p-6 transition-all ${sidebarOpen ? 'lg:ml-0' : ''}`}>
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order Management</h1>
              <p className="text-muted-foreground">Manage and process customer orders</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              {sidebarOpen ? <PanelLeft size={18} /> : <PanelRight size={18} />}
            </Button>
          </div>
          
          <div className="grid gap-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingOrders.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 flex items-center justify-center p-0">
                      {pendingOrders.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="delivering">Delivering</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="pending" className="mt-0">
                  {pendingOrders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pendingOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          isVendor={true}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <CardDescription className="text-center">
                          No pending orders at the moment.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="preparing" className="mt-0">
                  {preparingOrders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {preparingOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          isVendor={true}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <CardDescription className="text-center">
                          No orders in preparation at the moment.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="ready" className="mt-0">
                  {readyOrders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {readyOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          isVendor={true}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <CardDescription className="text-center">
                          No orders ready for delivery at the moment.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="delivering" className="mt-0">
                  {deliveringOrders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {deliveringOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          isVendor={true}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <CardDescription className="text-center">
                          No orders in delivery at the moment.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  {completedOrders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {completedOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          isVendor={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <CardDescription className="text-center">
                          No completed orders to show.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
