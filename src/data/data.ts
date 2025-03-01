
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
  {
    id: 'rest-1',
    name: 'Parul Deliveries',
    description: 'Delicious grilled meals and sandwiches for students on the go.',
    logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    coverImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    location: 'Main Food Court',
    cuisine: 'Fast Food',
    rating: 4.5,
    tags: ['Burgers', 'Sandwiches', 'Grill'],
    deliveryFee: 30.00,
    deliveryTime: '15-20 min',
    isOpen: true
  },
  {
    id: 'rest-2',
    name: 'Pizza Hub',
    description: 'Fresh pizzas made with premium ingredients right on campus.',
    logo: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    coverImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    location: 'CAPITOL Food Court',
    cuisine: 'Italian',
    rating: 4.2,
    tags: ['Pizza', 'Italian', 'Fast Food'],
    deliveryFee: 30.00,
    deliveryTime: '20-30 min',
    isOpen: true
  },
  {
    id: 'rest-3',
    name: 'Green Bowls',
    description: 'Healthy and nutritious salad bowls and smoothies.',
    logo: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
    coverImage: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
    location: 'GREENZY Food Court',
    cuisine: 'Healthy',
    rating: 4.7,
    tags: ['Healthy', 'Salads', 'Smoothies'],
    deliveryFee: 30.00,
    deliveryTime: '10-15 min',
    isOpen: true
  }
];

export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce.',
    price: 8.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-1',
    category: 'Burgers',
    isAvailable: true
  },
  {
    id: 'item-2',
    name: 'Grilled Chicken Sandwich',
    description: 'Grilled chicken breast with avocado, bacon, lettuce, and mayo.',
    price: 9.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-1',
    category: 'Sandwiches',
    isAvailable: true
  },
  {
    id: 'item-3',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil.',
    price: 12.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-2',
    category: 'Pizzas',
    isAvailable: true
  },
  {
    id: 'item-4',
    name: 'Pepperoni Pizza',
    description: 'Pizza topped with tomato sauce, mozzarella, and pepperoni slices.',
    price: 14.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-2',
    category: 'Pizzas',
    isAvailable: true
  },
  {
    id: 'item-5',
    name: 'Caesar Salad Bowl',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese.',
    price: 7.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-3',
    category: 'Salads',
    isAvailable: true
  },
  {
    id: 'item-6',
    name: 'Berry Blast Smoothie',
    description: 'Refreshing smoothie with mixed berries, yogurt, and honey.',
    price: 5.99,
    image: '/placeholder.svg',
    restaurantId: 'rest-3',
    category: 'Smoothies',
    isAvailable: true
  }
];

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
