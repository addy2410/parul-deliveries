
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  student_id: string;
  vendor_id: string;
  restaurant_id: string;
  shop_id: string; // Alias for restaurant_id
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'preparing' | 'prepared' | 'delivering' | 'delivered' | 'cancelled';
  delivery_location: string;
  student_name: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at?: string;
  restaurantName?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: 'pending' | 'preparing' | 'prepared' | 'delivering' | 'delivered' | 'cancelled';
  timestamp: string;
}
