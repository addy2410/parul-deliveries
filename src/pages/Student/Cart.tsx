
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Trash2, ShoppingCart, CreditCard, User, LogOut, Home } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Cart = () => {
  const { shopId } = useParams();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, restaurantName } = useCart();
  const { studentId, studentName, studentAddress, isAuthenticated, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(studentAddress || "");
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const total = totalPrice;

  useEffect(() => {
    if (studentAddress) {
      setDeliveryAddress(studentAddress);
    }
  }, [studentAddress]);

  // Debug log to check authentication status
  useEffect(() => {
    console.log("Cart component - Auth status:", isAuthenticated, "Student ID:", studentId);
  }, [isAuthenticated, studentId]);

  const handleRemoveItem = (id) => {
    removeItem(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, parseInt(newQuantity));
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/student/restaurants');
  };

  const handleCheckout = async () => {
    console.log("Checkout clicked - Auth status:", isAuthenticated, "Student ID:", studentId);
    
    // Double check authentication directly from localStorage
    const session = localStorage.getItem('studentSession');
    let currentStudentId = null;
    let currentStudentName = null;
    
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        if (parsedSession && parsedSession.userId) {
          currentStudentId = parsedSession.userId;
          currentStudentName = parsedSession.name || "Student";
          console.log("Student ID from localStorage:", currentStudentId);
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    }
    
    if (!currentStudentId) {
      toast.error("You need to be logged in to checkout");
      navigate("/student/login");
      return;
    }

    // Validate if we have the required data for checkout
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    // Get active restaurant ID from cart
    const activeRestaurantId = items[0]?.restaurantId;
    if (!activeRestaurantId) {
      toast.error("Cannot identify restaurant for this order");
      return;
    }

    setLoading(true);
    
    try {
      // Get vendor ID for the restaurant using direct query
      console.log("Fetching shop data for restaurant ID:", activeRestaurantId);
      
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("id", activeRestaurantId)
        .single();
        
      if (shopError) {
        console.error("Error fetching shop data:", shopError);
        toast.error("Failed to prepare order");
        setLoading(false);
        return;
      }
      
      if (!shopData || !shopData.vendor_id) {
        console.error("Shop data not found or vendor_id missing:", shopData);
        toast.error("Restaurant information incomplete");
        setLoading(false);
        return;
      }
      
      const vendorId = shopData.vendor_id;
      console.log("Found vendor ID:", vendorId, "for restaurant:", activeRestaurantId);
      
      // Prepare the order items
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Create the order with pending status - CORRECTED FIELD NAMES TO MATCH DATABASE
      console.log("Creating order with data:", {
        student_id: currentStudentId,
        vendor_id: vendorId,
        restaurant_id: activeRestaurantId,  // Changed from shop_id to restaurant_id
        items: orderItems,
        total_amount: total,
        status: "pending",
        delivery_location: deliveryAddress || "Campus",
        student_name: currentStudentName || "Student"
      });
      
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          student_id: currentStudentId,
          vendor_id: vendorId,
          restaurant_id: activeRestaurantId,  // Changed from shop_id to restaurant_id
          items: orderItems,
          total_amount: total,
          status: "pending",
          delivery_location: deliveryAddress || "Campus",
          student_name: currentStudentName || "Student"
        }])
        .select();

      if (orderError) {
        console.error("Failed to create order:", orderError);
        toast.error("Failed to create order");
        setLoading(false);
        return;
      }

      console.log("Order created successfully:", orderData);

      // Order created successfully, now create notification for the vendor
      if (orderData && orderData.length > 0) {
        const order = orderData[0];
        setCreatedOrderId(order.id);
        
        // Create notification
        console.log("Creating notification for vendor:", vendorId);
        const { error: notifError } = await supabase
          .from("notifications")
          .insert([{
            recipient_id: vendorId,
            type: "new_order",
            message: `New order from ${currentStudentName || "a student"}`,
            data: {
              order_id: order.id,
              items: orderItems,
              total_amount: total,
              delivery_location: deliveryAddress || "Campus"
            }
          }]);

        if (notifError) {
          console.error("Failed to create notification:", notifError);
        } else {
          console.log("Notification created successfully for vendor:", vendorId);
        }

        // Show success toast and enable Proceed to Payment button
        toast.success("Order sent to vendor for confirmation!");
        setOrderCreated(true);
        
        // Ensure we have the order ID stored correctly
        console.log("Setting created order ID:", order.id);
        setCreatedOrderId(order.id);
      }
    } catch (e) {
      console.error("Error during checkout:", e);
      toast.error("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (createdOrderId) {
      console.log("Navigating to order tracking for ID:", createdOrderId);
      // Clear the cart after successful order placement and navigation
      clearCart();
      navigate(`/student/order-tracking/${createdOrderId}`);
    } else {
      console.error("Cannot proceed to payment: order ID is missing");
      toast.error("Order ID is missing. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Logo and User Navigation */}
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/student/restaurants" className="flex items-center">
            <span className="text-xl font-bold fontLogo text-primary">
              CampusGrub
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <User className="h-5 w-5" />
                    {studentName && <span className="ml-2 hidden md:inline">{studentName}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/student/orders/active" className="cursor-pointer w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/student/address-book" className="cursor-pointer w-full">
                      Address Book
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/student/login')}>
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/restaurants')} className="mr-2">
            <Home className="h-4 w-4 mr-2" />
            Back to Restaurants
          </Button>
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add items from a restaurant to get started
            </p>
            <Button onClick={() => navigate("/student/restaurants")}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex justify-between items-center">
                    <span>Cart Items</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-16 h-16 rounded-md bg-cover bg-center mr-4"
                            style={{
                              backgroundImage: `url(${item.image})`,
                            }}
                          ></div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.restaurantName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery Fee
                        </span>
                        <span>₹0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Delivery Address
                      </label>
                      <Textarea
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    {!orderCreated ? (
                      <Button
                        className="w-full bg-[#ea384c] hover:bg-[#d02e40] text-white font-medium py-3"
                        size="lg"
                        onClick={handleCheckout}
                        disabled={items.length === 0 || loading}
                      >
                        {loading ? "Processing..." : "Checkout"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                        size="lg"
                        onClick={handleProceedToPayment}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Payment
                      </Button>
                    )}

                    {!isAuthenticated && (
                      <p className="text-sm text-muted-foreground text-center">
                        Please{" "}
                        <a
                          href="/student/login"
                          className="text-[#ea384c] underline"
                        >
                          log in
                        </a>{" "}
                        to complete your order
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
