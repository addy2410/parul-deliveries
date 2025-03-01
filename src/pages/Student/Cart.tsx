
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";

type CheckoutStep = 'cart' | 'address' | 'payment';

const DELIVERY_FEE = 20; // ₹20 delivery fee

const StudentCart = () => {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const navigate = useNavigate();

  // Handle phone login
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      toast.success('Login successful');
      setIsLoggedIn(true);
      // In a real app, we would send OTP here
    } else {
      toast.error('Please enter a valid phone number');
    }
  };

  // Handle address submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim().length > 0) {
      if (saveAddress) {
        // In a real app, we would save this to the user's profile
        localStorage.setItem('savedAddress', address);
        toast.success('Address saved for future orders');
      }
      setCheckoutStep('payment');
    } else {
      toast.error('Please enter your delivery address');
    }
  };

  // Handle payment
  const handlePayment = () => {
    // In a real app, we would process the payment here
    toast.success('Payment successful');
    clearCart();
    navigate('/student/order-success');
  };

  if (items.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/student/restaurants">
            <ArrowLeft size={16} className="mr-2" /> Continue Shopping
          </Link>
        </Button>
        
        <div className="flex items-center mb-6">
          <ShoppingCart className="mr-2" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        
        <Card className="my-8">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <ShoppingCart size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add items from restaurants to get started</p>
            <Button asChild>
              <Link to="/student/restaurants">Browse Restaurants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phone login step
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/student/restaurants">
            <ArrowLeft size={16} className="mr-2" /> Back to Restaurants
          </Link>
        </Button>
        
        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Login to continue</h2>
              <p className="text-sm text-muted-foreground">
                Please enter your phone number to receive an OTP
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneLogin}>
                <div className="mb-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Continue</Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              <p>For demo: Any 10-digit number will work</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Cart review step
  if (checkoutStep === 'cart') {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/student/restaurants">
            <ArrowLeft size={16} className="mr-2" /> Continue Shopping
          </Link>
        </Button>
        
        <div className="flex items-center mb-6">
          <ShoppingCart className="mr-2" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center mr-4 bg-gray-100 rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{(totalPrice + DELIVERY_FEE).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setCheckoutStep('address')}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Address step
  if (checkoutStep === 'address') {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" className="mb-4" onClick={() => setCheckoutStep('cart')}>
          <ArrowLeft size={16} className="mr-2" /> Back to Cart
        </Button>
        
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Delivery Address</h1>
          
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleAddressSubmit}>
                <div className="mb-4">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox 
                    id="save-address" 
                    checked={saveAddress} 
                    onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                  />
                  <Label htmlFor="save-address">
                    Save this address in my address book
                  </Label>
                </div>
                
                <Button type="submit" className="w-full">Continue to Payment</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" onClick={() => setCheckoutStep('address')}>
        <ArrowLeft size={16} className="mr-2" /> Back to Address
      </Button>
      
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Order Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>₹{(totalPrice + DELIVERY_FEE).toFixed(2)}</span>
              </div>
              
              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Delivery Address:</p>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-[#6741d9] hover:bg-[#5f3dc4]" 
              onClick={handlePayment}
            >
              Pay with UPI
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentCart;
