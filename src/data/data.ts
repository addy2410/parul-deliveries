
import { MenuItem } from "./types";

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
    name: 'CAPITOL Food Court',
    description: 'Authentic Indian cuisine with a modern twist. From spicy curries to fresh tandoor items.',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    location: 'CAPITOL Building',
    cuisine: 'Indian',
    rating: 4.5,
    tags: ['North Indian', 'South Indian', 'Snacks'],
    deliveryFee: 30.00,
    deliveryTime: '15-20 min',
    isOpen: true
  },
  {
    id: 'rest-2',
    name: 'GREENZY Food Court',
    description: 'Healthy and nutritious salad bowls and smoothies with organic ingredients.',
    logo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    location: 'GREENZY Building',
    cuisine: 'Healthy',
    rating: 4.7,
    tags: ['Healthy', 'Salads', 'Organic'],
    deliveryFee: 30.00,
    deliveryTime: '10-15 min',
    isOpen: true
  },
  {
    id: 'rest-3',
    name: 'Main Food Court',
    description: 'A variety of delicious food options ranging from traditional Indian snacks to international cuisines.',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    location: 'Main Building',
    cuisine: 'Multi-cuisine',
    rating: 4.2,
    tags: ['Fast Food', 'Indian', 'Chinese'],
    deliveryFee: 30.00,
    deliveryTime: '20-30 min',
    isOpen: true
  }
];

// Update menu items with proper images for better visibility
export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Butter Chicken',
    description: 'Tender chicken cooked in a creamy tomato sauce with Indian spices and butter.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
    restaurantId: 'rest-1',
    category: 'Main Course',
    isAvailable: true
  },
  {
    id: 'item-2',
    name: 'Paneer Tikka',
    description: 'Chunks of paneer marinated in spices and grilled in a tandoor.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
    restaurantId: 'rest-1',
    category: 'Starters',
    isAvailable: true
  },
  {
    id: 'item-3',
    name: 'Quinoa Salad Bowl',
    description: 'Nutritious salad with quinoa, fresh vegetables, and a light dressing.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    restaurantId: 'rest-2',
    category: 'Salads',
    isAvailable: true
  },
  {
    id: 'item-4',
    name: 'Berry Blast Smoothie',
    description: 'Refreshing smoothie with mixed berries, yogurt, and honey.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
    restaurantId: 'rest-2',
    category: 'Beverages',
    isAvailable: true
  },
  {
    id: 'item-5',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato mixture, served with chutney and sambar.',
    price: 90,
    image: '/lovable-uploads/1271dc67-e1e0-43ca-a49d-85a5eb8f1622.jpg',
    restaurantId: 'rest-3',
    category: 'South Indian',
    isAvailable: true
  },
  {
    id: 'item-6',
    name: 'Vada Pav',
    description: 'Mumbai style spicy potato fritter in a bun with chutneys.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84',
    restaurantId: 'rest-3',
    category: 'Snacks',
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
