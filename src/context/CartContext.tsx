
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { restaurants } from "@/data/data";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  restaurantName?: string; 
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  restaurantId: string | null;
  restaurantName: string | null;
  
  // Aliases for backward compatibility with existing components
  cartItems: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  
  // Calculate derived values
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("campus-grub-cart");
    const savedRestaurantId = localStorage.getItem("campus-grub-restaurant");
    const savedRestaurantName = localStorage.getItem("campus-grub-restaurant-name");
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing saved cart", e);
        localStorage.removeItem("campus-grub-cart");
      }
    }
    
    if (savedRestaurantId) {
      setRestaurantId(savedRestaurantId);
    }

    if (savedRestaurantName) {
      setRestaurantName(savedRestaurantName);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("campus-grub-cart", JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem("campus-grub-restaurant", restaurantId);
    }
    if (restaurantName) {
      localStorage.setItem("campus-grub-restaurant-name", restaurantName);
    }
  }, [items, restaurantId, restaurantName]);
  
  const addItem = (item: MenuItem, quantity: number = 1) => {
    // Find restaurant name
    const restaurant = restaurants.find(r => r.id === item.restaurantId);
    const currentRestaurantName = restaurant?.name || 'Unknown Restaurant';
    
    // Check if we need to clear the cart (items from different restaurants)
    if (restaurantId && item.restaurantId !== restaurantId && items.length > 0) {
      if (window.confirm("Your cart contains items from another restaurant. Would you like to clear your cart and add this item?")) {
        setItems([{ ...item, quantity, restaurantName: currentRestaurantName }]);
        setRestaurantId(item.restaurantId);
        setRestaurantName(currentRestaurantName);
        toast.success(`Added ${quantity} ${item.name} to your cart`);
      }
      return;
    }
    
    // Set restaurant ID if it's not set yet
    if (!restaurantId) {
      setRestaurantId(item.restaurantId);
      setRestaurantName(currentRestaurantName);
    }
    
    // Check if item already exists in cart
    const existingItemIndex = items.findIndex((cartItem) => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      setItems(newItems);
    } else {
      // Add new item to cart
      setItems([...items, { ...item, quantity, restaurantName: currentRestaurantName }]);
    }
    
    toast.success(`Added ${quantity} ${item.name} to your cart`);
  };
  
  const removeItem = (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    
    // If cart is empty, clear restaurant ID
    if (newItems.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
      localStorage.removeItem("campus-grub-restaurant");
      localStorage.removeItem("campus-grub-restaurant-name");
    }
    
    toast.info("Item removed from cart");
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const newItems = items.map((item) => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    setItems(newItems);
  };
  
  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    localStorage.removeItem("campus-grub-cart");
    localStorage.removeItem("campus-grub-restaurant");
    localStorage.removeItem("campus-grub-restaurant-name");
    toast.info("Cart cleared");
  };
  
  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      restaurantId,
      restaurantName,
      
      // Aliases for backward compatibility
      cartItems: items,
      addToCart: addItem,
      removeFromCart: removeItem
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
