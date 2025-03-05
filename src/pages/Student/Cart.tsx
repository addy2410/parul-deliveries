
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ArrowLeft, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";
import { supabase } from "@/lib/supabase";

const StudentCart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, restaurantId } = useCart();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;
  
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
  
  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentComplete = async (paymentMethod: string) => {
    try {
      setIsProcessingOrder(true);
      
      // Get student information from localStorage
      const studentId = localStorage.getItem('currentStudentId');
      const studentName = localStorage.getItem('studentName');
      
      if (!studentId || !studentName) {
        toast.error("You need to be logged in to place an order");
        navigate("/student/login");
        return;
      }
      
      if (!restaurantId) {
        toast.error("Unable to identify restaurant. Please try again.");
        return;
      }
      
      // Format order items for the database
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Call the edge function to place the order
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: {
          items: orderItems,
          totalAmount: total,
          restaurantId: restaurantId,
          studentId: studentId,
          studentName: studentName,
          deliveryLocation: "Campus Location (Set in profile)" // In a real app, this would come from the user's profile
        }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || data?.error || "Failed to place order");
      }
      
      // Order successfully placed
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/student/order-success", { 
        state: { 
          orderId: data.orderId,
          orderTotal: total
        } 
      });
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place your order. Please try again.");
    } finally {
      setIsProcessingOrder(false);
      setIsPaymentModalOpen(false);
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
                <Button 
                  className="w-full mt-4 bg-[#ea384c] hover:bg-[#d02e40]"
                  onClick={handlePlaceOrder}
                  disabled={isProcessingOrder}
                >
                  {isProcessingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
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
                  onClick={() => handlePaymentComplete('upi')}
                  disabled={isProcessingOrder}
                >
                  <img src="https://images.unsplash.com/photo-1493962853295-0fd70327578a" alt="UPI" className="w-6 h-6 mr-2" />
                  UPI Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-2 border-green-500 hover:bg-green-50"
                  onClick={() => handlePaymentComplete('card')}
                  disabled={isProcessingOrder}
                >
                  <img src="https://images.unsplash.com/photo-1582562124811-c09040d0a901" alt="Card" className="w-6 h-6 mr-2" />
                  Credit/Debit Card
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start border-2 border-orange-500 hover:bg-orange-50"
                  onClick={() => handlePaymentComplete('cod')}
                  disabled={isProcessingOrder}
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
                disabled={isProcessingOrder}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#ea384c] hover:bg-[#d02e40]"
                onClick={() => handlePaymentComplete('card')}
                disabled={isProcessingOrder}
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total.toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentCart;
