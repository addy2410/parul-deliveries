import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAddressBook } from "@/context/AddressBookContext";
import { toast } from "sonner";
import { CircleDollarSign, MapPin, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const StudentCart = () => {
  const navigate = useNavigate();
  const { cart, clearCart, removeItem, updateQuantity } = useCart();
  const { user, studentName } = useAuth();
  const { addresses } = useAddressBook();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to view your cart.");
      navigate("/student/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0].address);
    }
  }, [addresses]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  // Calculate the subtotal with delivery fee
  const calculateSubtotal = () => {
    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });
    return subtotal;
  };

  // Calculate the delivery fee
  const deliveryFee = 30; // Fixed delivery fee of 30 rupees

  // Calculate the total with delivery fee
  const calculateTotal = () => {
    return calculateSubtotal() + deliveryFee;
  };

  const handleAddressSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(event.target.value);
  };

  const handleProceedToPayment = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to place an order.");
        navigate("/student/login");
        return;
      }

      if (!cart.restaurantId || !cart.vendorId) {
        toast.error("Cart is invalid. Please add items from a restaurant.");
        return;
      }

      // Create order with delivery fee included in total
      const order = {
        student_id: user.id,
        student_name: studentName || "Anonymous Student",
        restaurant_id: cart.restaurantId,
        vendor_id: cart.vendorId,
        items: cart.items,
        total_amount: calculateTotal(), // Use the total with delivery fee
        status: "pending",
        delivery_location: selectedAddress || "Campus Location"
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select();

      if (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order. Please try again.");
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/student/order-success?orderId=${data[0].id}`);
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        
        {cart.items.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <XCircle className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty.</p>
              <Button onClick={() => navigate("/student/restaurants")} className="mt-4">
                Back to Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Items in Your Cart</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-4">
                    {cart.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center">
                          <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span>{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleClearCart} variant="ghost" className="mt-4">
                    Clear Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Cart Summary Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {/* Delivery Address Section */}
              <div className="mb-4">
                <Label htmlFor="address">Delivery Address</Label>
                <select 
                  id="address" 
                  className="w-full mt-1 p-2 border rounded"
                  value={selectedAddress || ""}
                  onChange={handleAddressSelect}
                >
                  {addresses.length > 0 ? (
                    addresses.map((addressObj, index) => (
                      <option key={index} value={addressObj.address}>
                        {addressObj.address}
                      </option>
                    ))
                  ) : (
                    <option value="">No address added. Please add in address book.</option>
                  )}
                </select>
                <Button variant="link" onClick={() => navigate("/student/address-book")} className="mt-2 p-0">
                  Manage Addresses
                </Button>
              </div>
              
              <Button 
                onClick={handleProceedToPayment} 
                disabled={!cart.items.length} 
                className="w-full bg-primary"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCart;
