
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ArrowLeft, Home, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";
import { supabase } from "@/lib/supabase";

const StudentCart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("Campus Main Building");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("Student");
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Try to get from localStorage as fallback (for development)
        const storedSession = localStorage.getItem('studentSession');
        if (storedSession) {
          try {
            const session = JSON.parse(storedSession);
            setStudentId(session.userId);
            setStudentName(session.name || "Student");
          } catch (e) {
            console.error("Error parsing stored session:", e);
          }
        }
        return;
      }
      
      setStudentId(data.session.user.id);
      
      // Get student name from profile
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('name')
        .eq('id', data.session.user.id)
        .single();
        
      if (!profileError && profile) {
        setStudentName(profile.name);
      } else {
        // Fallback to email if name not available
        setStudentName(data.session.user.email?.split('@')[0] || "Student");
      }
    };
    
    checkAuth();
  }, []);
  
  const groupedCartItems = items.reduce((acc: any, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {});
  
  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
    toast.success("Item removed from cart");
  };
  
  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (!studentId) {
      toast.error("Please login to place an order");
      navigate("/student/login");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if we have items from a single shop only
      const shopIds = Array.from(new Set(items.map(item => item.restaurantId)));
      if (shopIds.length > 1) {
        toast.error("You can only order from one restaurant at a time");
        return;
      }
      
      const shopId = shopIds[0];
      
      // Get vendor ID for this shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('vendor_id')
        .eq('id', shopId)
        .single();
        
      if (shopError || !shopData) {
        toast.error("Error finding restaurant details");
        console.error("Error fetching shop:", shopError);
        return;
      }
      
      // Prepare order items format for the database
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Create the order with pending status
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            student_id: studentId,
            vendor_id: shopData.vendor_id,
            restaurant_id: shopId, // Changed from shop_id to restaurant_id
            items: orderItems,
            total_amount: total,
            status: 'pending',
            delivery_location: deliveryLocation,
            student_name: studentName
          }
        ])
        .select();
        
      if (orderError) {
        console.error("Error creating order:", orderError);
        toast.error("Failed to create order");
        return;
      }
      
      // Order created successfully
      toast.success("Checkout complete! Waiting for vendor confirmation.");
      setCheckoutComplete(true);
      setCurrentOrderId(orderData[0]?.id);
      
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePlaceOrder = () => {
    if (!checkoutComplete) {
      toast.error("Please checkout first before proceeding to payment");
      return;
    }
    
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentComplete = async () => {
    try {
      // Payment already processed, just need to clear cart and navigate
      clearCart();
      
      // Navigate to order success page with the order ID
      navigate("/student/order-success", {
        state: { 
          orderId: currentOrderId,
          total: total.toFixed(2) 
        }
      });
    } catch (error) {
      console.error("Error finalizing order:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPaymentModalOpen(false);
    }
  };

  const handleViewOrderStatus = () => {
    if (currentOrderId) {
      navigate(`/student/order/${currentOrderId}/tracking`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        {items.length === 0 ? (
          <Card className="max-w-md mx-auto mt-16">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CardTitle className="text-lg font-semibold mb-2">Your cart is empty</CardTitle>
              <CardDescription className="text-muted-foreground">
                Looks like you haven't added anything to your cart yet.
              </CardDescription>
              <Button asChild className="mt-4 bg-[#ea384c] hover:bg-[#d02e40]">
                <Link to="/student/restaurants">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Restaurants
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-6 flex justify-between items-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/student/restaurants" className="flex items-center gap-1">
                    <ArrowLeft size={16} />
                    Back to Restaurants
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleClearCart}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </Button>
              </div>
              
              <ScrollArea className="h-[450px]">
                <div className="space-y-4">
                  {Object.entries(groupedCartItems).map(([restaurantId, { restaurantName, items }]: [string, any]) => (
                    <Card key={restaurantId}>
                      <CardHeader>
                        <CardTitle>{restaurantName}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className="space-y-2">
                          {items.map(item => (
                            <li key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{item.name}</span>
                                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <div className="mt-4">
                  <label className="text-sm font-medium block mb-2">
                    Delivery Location
                  </label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  >
                    <option value="Campus Main Building">Campus Main Building</option>
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                    <option value="Library">Library</option>
                    <option value="Student Center">Student Center</option>
                    <option value="Sports Complex">Sports Complex</option>
                  </select>
                </div>
                
                {!checkoutComplete ? (
                  <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Checkout"}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm p-2 bg-green-50 border border-green-200 rounded text-green-700">
                      Checkout complete! Waiting for vendor confirmation
                    </div>
                    <Button 
                      className="w-full mt-2"
                      variant="outline"
                      onClick={handleViewOrderStatus}
                    >
                      Check Order Status
                    </Button>
                    <Button 
                      className="w-full mt-2 bg-[#ea384c] hover:bg-[#d02e40]"
                      onClick={handlePlaceOrder}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start border-2 border-blue-500 hover:bg-blue-50"
                  onClick={handlePaymentComplete}
                  disabled={isSubmitting}
                >
                  <img src="https://images.unsplash.com/photo-1493962853295-0fd70327578a" alt="UPI" className="w-6 h-6 mr-2" />
                  UPI Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-2 border-green-500 hover:bg-green-50"
                  onClick={handlePaymentComplete}
                  disabled={isSubmitting}
                >
                  <img src="https://images.unsplash.com/photo-1582562124811-c09040d0a901" alt="Card" className="w-6 h-6 mr-2" />
                  Credit/Debit Card
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-2 border-orange-500 hover:bg-orange-50"
                  onClick={handlePaymentComplete}
                  disabled={isSubmitting}
                >
                  <img src="https://images.unsplash.com/photo-1466721591366-2d5fba72006d" alt="COD" className="w-6 h-6 mr-2" />
                  Cash on Delivery
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#ea384c] hover:bg-[#d02e40]"
                onClick={handlePaymentComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentCart;
