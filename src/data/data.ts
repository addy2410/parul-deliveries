export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  category: string;
  isAvailable?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  location: string;
  rating: number;
  cuisine?: string;
  tags: string[];
  deliveryFee: number;
  deliveryTime: string;
  isOpen: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDeliveryTime: string;
  deliveryLocation: string;
}

// Export data collections
export const restaurants: Restaurant[] = [
  // Only keeping BlueZ Biryani (removing CAPITOL, GREENZY and Main Food Court)
];

// Update menu items with proper images for better visibility
export const menuItems: MenuItem[] = [
  // Only keeping BlueZ Biryani items (removed items for CAPITOL, GREENZY and Main Food Court)
];

// Keep the rest of the file unchanged
export const sampleOrders: Order[] = [
  {
    id: 'order-1001',
    restaurantId: 'rest-1',
    customerId: 'cust-1',
    customerName: 'John Smith',
    items: [
      {
        menuItemId: 'item-1',
        name: 'Classic Cheeseburger',
        price: 8.99,
        quantity: 2
      },
      {
        menuItemId: 'item-2',
        name: 'Grilled Chicken Sandwich',
        price: 9.99,
        quantity: 1
      }
    ],
    totalAmount: 27.97,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDeliveryTime: '20-25 min',
    deliveryLocation: 'Engineering Building, Room 305'
  },
  {
    id: 'order-1002',
    restaurantId: 'rest-2',
    customerId: 'cust-2',
    customerName: 'Emily Johnson',
    items: [
      {
        menuItemId: 'item-3',
        name: 'Margherita Pizza',
        price: 12.99,
        quantity: 1
      }
    ],
    totalAmount: 12.99,
    status: 'preparing',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    estimatedDeliveryTime: '10-15 min',
    deliveryLocation: 'Library, Study Area 2'
  },
  {
    id: 'order-1003',
    restaurantId: 'rest-3',
    customerId: 'cust-3',
    customerName: 'Michael Wilson',
    items: [
      {
        menuItemId: 'item-5',
        name: 'Caesar Salad Bowl',
        price: 7.99,
        quantity: 1
      },
      {
        menuItemId: 'item-6',
        name: 'Berry Blast Smoothie',
        price: 5.99,
        quantity: 1
      }
    ],
    totalAmount: 13.98,
    status: 'delivered',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
    estimatedDeliveryTime: 'Delivered',
    deliveryLocation: 'Student Center, Table 8'
  }
];
