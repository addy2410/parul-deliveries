import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import StudentHeader from "@/components/StudentHeader";

const StudentCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;
  
  const groupedCartItems = cartItems.reduce((acc: any, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {});
  
  const handleRemoveFromCart = (menuItemId: string) => {
    removeFromCart(menuItemId);
    toast.success("Item removed from cart");
  };
  
  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };
  
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // In a real app, you would send the cart data to the server
    // and handle the order placement logic there
    toast.success("Order placed successfully!");
    clearCart();
    navigate("/student/order-success");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="container mx-auto p-4">
        {cartItems.length === 0 ? (
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
                            <li key={item.menuItemId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{item.name}</span>
                                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveFromCart(item.menuItemId)}
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
                >
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCart;
