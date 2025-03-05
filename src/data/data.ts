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

// Export data collections - Only keeping BlueZ Biryani
export const restaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'BlueZ Biryani',
    description: 'Authentic Hyderabadi Biryani and kebabs',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    location: 'Parul Mandir',
    rating: 4.8,
    cuisine: 'Hyderabadi',
    tags: ['Hyderabadi', 'Biryani', 'Kebabs'],
    deliveryFee: 30.00,
    deliveryTime: '20-30 min',
    isOpen: true
  }
];

// Keep only BlueZ Biryani menu items
export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
    restaurantId: 'rest-1',
    category: 'Burgers',
    isAvailable: true
  },
  {
    id: 'item-2',
    name: 'Grilled Chicken Sandwich',
    description: 'Marinated grilled chicken breast with avocado, bacon, and honey mustard',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589',
    restaurantId: 'rest-1',
    category: 'Sandwiches',
    isAvailable: true
  },
  {
    id: 'item-3',
    name: 'Hyderabadi Dum Biryani',
    description: 'Fragrant basmati rice with spiced meat, cooked in a sealed pot',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    restaurantId: 'rest-1',
    category: 'Biryani',
    isAvailable: true
  },
  {
    id: 'item-4',
    name: 'Chicken 65',
    description: 'Spicy, deep-fried chicken dish from Chennai, India',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58',
    restaurantId: 'rest-1',
    category: 'Appetizers',
    isAvailable: true
  },
  {
    id: 'item-5',
    name: 'Seekh Kebab',
    description: 'Minced meat mixed with spices and grilled on skewers',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
    restaurantId: 'rest-1',
    category: 'Kebabs',
    isAvailable: true
  }
];

// Keep the sample orders
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
