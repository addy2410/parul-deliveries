
import React from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, removeFromCart, clearCart } = useCart();
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;
  
  // Group items by restaurant
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
  
  return (
    <div className="flex flex-col h-[80vh]">
      <ScrollArea className="flex-1 p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">
              Your cart is empty
            </p>
            <Button variant="outline" asChild>
              <Link to="/student/restaurants">Browse Restaurants</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCartItems).map(([restaurantId, restaurant]: [string, any]) => (
              <div key={restaurantId} className="space-y-2">
                <h3 className="font-medium">{restaurant.restaurantName}</h3>
                <ul className="space-y-2">
                  {restaurant.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>₹{item.price.toFixed(2)} × {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {items.length > 0 && (
        <div className="border-t p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button 
              className="w-full bg-[#ea384c] hover:bg-[#d02e40]"
              asChild
            >
              <Link to="/student/cart">Proceed to Checkout</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
