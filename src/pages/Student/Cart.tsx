import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import { restaurants } from "@/data/data";

const Cart = () => {
  const { shopId } = useParams();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { studentId, studentName, studentAddress } = useStudentAuth();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState(studentAddress || "");
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const total = totalPrice;
  const { restaurantName } = useCart();

  useEffect(() => {
    if (!shopId) return;

    const fetchShopData = async () => {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*, vendor_users!inner(*)")
          .eq("id", shopId)
          .single();

        if (error) {
          console.error("Error fetching shop data:", error);
          return;
        }

        setShopData({
          ...data,
          vendor_id: data.vendor_users.id,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  useEffect(() => {
    if (studentAddress) {
      setDeliveryAddress(studentAddress);
    }
  }, [studentAddress]);

  const handleRemoveItem = (id) => {
    removeItem(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, parseInt(newQuantity));
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = async () => {
    if (!studentId) {
      toast.error("You need to be logged in to checkout");
      navigate("/student/login");
      return;
    }

    try {
      // Get restaurant name from context
      const shopName = restaurantName || "Unknown Restaurant";
      
      // Prepare the order items
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Create the order with pending status
      const { data, error } = await supabase.from("orders").insert([
        {
          student_id: studentId,
          vendor_id: shopData.vendor_id,
          restaurant_id: shopId, // Using restaurant_id (previously changed from shop_id)
          items: orderItems,
          total_amount: total,
          status: "pending",
          delivery_location: studentAddress || "Campus",
          student_name: studentName || "Student"
        }
      ]).select();

      if (error) {
        console.error("Failed to create order:", error);
        toast.error("Failed to create order");
        return;
      }

      console.log("Order created successfully:", data);

      // Order created successfully, now create notification for the vendor
      if (data && data.length > 0) {
        const order = data[0];
        
        // Create notification
        const { error: notifError } = await supabase.from("notifications").insert([
          {
            recipient_id: shopData.vendor_id,
            type: "new_order",
            message: `New order from ${studentName || "a student"}`,
            data: {
              order_id: order.id,
              items: orderItems,
              total_amount: total,
              delivery_location: studentAddress || "Campus"
            }
          }
        ]);

        if (notifError) {
          console.error("Failed to create notification:", notifError);
        }

        // Show success toast and enable Proceed to Payment button
        toast.success("Order sent to vendor for confirmation!");
        setOrderCreated(true);
        setCreatedOrderId(order.id);
      }
    } catch (e) {
      console.error("Error during checkout:", e);
      toast.error("An error occurred during checkout");
    }
  };

  const handleProceedToPayment = () => {
    if (createdOrderId) {
      navigate(`/student/payment/${createdOrderId}`);
    }
  };

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

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
            <Card>
              <CardHeader>
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
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b"
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
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
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
                      className="w-full bg-primary"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={items.length === 0 || !studentId}
                    >
                      Place Order
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      onClick={handleProceedToPayment}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </Button>
                  )}

                  {!studentId && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please{" "}
                      <a
                        href="/student/login"
                        className="text-primary underline"
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
  );
};

export default Cart;
