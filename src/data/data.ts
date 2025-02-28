
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  foodCourtId: string;
  image: string;
  rating: number;
  deliveryTime: string;
  isOpen: boolean;
}

export interface FoodCourt {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  restaurantId: string;
  restaurantName: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  deliveryLocation: string;
  estimatedDeliveryTime?: string;
}

// Food Courts
export const foodCourts: FoodCourt[] = [
  {
    id: "fc-1",
    name: "CAPITOL",
    location: "North Campus",
    description: "The main food court located at the heart of the university, offering a variety of cuisines.",
    image: "https://images.unsplash.com/photo-1615972914574-95ac71350fe8?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "fc-2",
    name: "GREENZY",
    location: "East Campus",
    description: "A modern food court specializing in healthy and vegetarian options.",
    image: "https://images.unsplash.com/photo-1613341205042-5b39f5c7bd2f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "fc-3",
    name: "MAIN FOOD COURT",
    location: "South Campus",
    description: "The largest food court on campus, featuring international cuisines and local favorites.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Restaurants
export const restaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "The Campus Grill",
    description: "Specializing in burgers, steaks, and American classics.",
    location: "CAPITOL Food Court",
    foodCourtId: "fc-1",
    image: "https://images.unsplash.com/photo-1608877907149-a5c32d232da6?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.5,
    deliveryTime: "15-20 min",
    isOpen: true,
  },
  {
    id: "rest-2",
    name: "Pizza Paradise",
    description: "Authentic Italian pizzas and pasta dishes.",
    location: "CAPITOL Food Court",
    foodCourtId: "fc-1",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.3,
    deliveryTime: "20-25 min",
    isOpen: true,
  },
  {
    id: "rest-3",
    name: "Fresh & Green",
    description: "Healthy salads, smoothies, and grain bowls.",
    location: "GREENZY Food Court",
    foodCourtId: "fc-2",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=3077&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    deliveryTime: "10-15 min",
    isOpen: true,
  },
  {
    id: "rest-4",
    name: "Sushi Spot",
    description: "Fresh sushi, sashimi, and Japanese specialties.",
    location: "MAIN FOOD COURT",
    foodCourtId: "fc-3",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.8,
    deliveryTime: "25-30 min",
    isOpen: true,
  },
  {
    id: "rest-5",
    name: "Taco Fiesta",
    description: "Authentic Mexican tacos, burritos, and quesadillas.",
    location: "MAIN FOOD COURT",
    foodCourtId: "fc-3",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=3280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.2,
    deliveryTime: "15-20 min",
    isOpen: true,
  },
  {
    id: "rest-6",
    name: "Curry House",
    description: "Flavorful Indian curries and bread.",
    location: "MAIN FOOD COURT",
    foodCourtId: "fc-3",
    image: "https://images.unsplash.com/photo-1631916719162-972eb2c795c3?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    deliveryTime: "20-25 min",
    isOpen: true,
  },
];

// Menu Items
export const menuItems: MenuItem[] = [
  // The Campus Grill (rest-1) Menu Items
  {
    id: "item-1",
    restaurantId: "rest-1",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=3115&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Burgers",
    isAvailable: true,
  },
  {
    id: "item-2",
    restaurantId: "rest-1",
    name: "BBQ Bacon Burger",
    description: "Beef patty with crispy bacon, BBQ sauce, onion rings, and melted pepper jack cheese.",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=3269&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Burgers",
    isAvailable: true,
  },
  {
    id: "item-3",
    restaurantId: "rest-1",
    name: "Grilled Chicken Sandwich",
    description: "Marinated grilled chicken breast with avocado, lettuce, and honey mustard.",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sandwiches",
    isAvailable: true,
  },
  {
    id: "item-4",
    restaurantId: "rest-1",
    name: "Sweet Potato Fries",
    description: "Crispy sweet potato fries with a side of chipotle mayo.",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1639744093378-d21bd126f1a9?q=80&w=3088&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sides",
    isAvailable: true,
  },
  
  // Pizza Paradise (rest-2) Menu Items
  {
    id: "item-5",
    restaurantId: "rest-2",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Pizzas",
    isAvailable: true,
  },
  {
    id: "item-6",
    restaurantId: "rest-2",
    name: "Pepperoni Pizza",
    description: "Pizza with tomato sauce, mozzarella, and pepperoni slices.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=3280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Pizzas",
    isAvailable: true,
  },
  {
    id: "item-7",
    restaurantId: "rest-2",
    name: "Spaghetti Carbonara",
    description: "Spaghetti with creamy sauce, pancetta, egg, and parmesan cheese.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=3348&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Pasta",
    isAvailable: true,
  },
  {
    id: "item-8",
    restaurantId: "rest-2",
    name: "Garlic Bread",
    description: "Fresh bread with garlic butter and herbs.",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1573140401552-3fab0b24427f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sides",
    isAvailable: true,
  },
  
  // Fresh & Green (rest-3) Menu Items
  {
    id: "item-9",
    restaurantId: "rest-3",
    name: "Mediterranean Bowl",
    description: "Quinoa, hummus, roasted vegetables, feta cheese, and olive oil dressing.",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Bowls",
    isAvailable: true,
  },
  {
    id: "item-10",
    restaurantId: "rest-3",
    name: "Avocado Toast",
    description: "Multigrain bread with smashed avocado, cherry tomatoes, and microgreens.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1603046891744-1f65e5e8aa1b?q=80&w=3349&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Breakfast",
    isAvailable: true,
  },
  {
    id: "item-11",
    restaurantId: "rest-3",
    name: "Berry Blast Smoothie",
    description: "Blend of strawberries, blueberries, banana, and almond milk.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1638176066069-41be288c0f98?q=80&w=2892&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Drinks",
    isAvailable: true,
  },
  
  // Sushi Spot (rest-4) Menu Items
  {
    id: "item-12",
    restaurantId: "rest-4",
    name: "California Roll",
    description: "Crab, avocado, and cucumber roll with tobiko.",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sushi Rolls",
    isAvailable: true,
  },
  {
    id: "item-13",
    restaurantId: "rest-4",
    name: "Salmon Nigiri",
    description: "Fresh salmon over seasoned rice.",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=3352&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Nigiri",
    isAvailable: true,
  },
  {
    id: "item-14",
    restaurantId: "rest-4",
    name: "Edamame",
    description: "Steamed soybeans with sea salt.",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?q=80&w=3289&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sides",
    isAvailable: true,
  },
  
  // Taco Fiesta (rest-5) Menu Items
  {
    id: "item-15",
    restaurantId: "rest-5",
    name: "Carne Asada Tacos",
    description: "Three tacos with grilled steak, onion, cilantro, and salsa.",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1611250188496-e966043a0629?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Tacos",
    isAvailable: true,
  },
  {
    id: "item-16",
    restaurantId: "rest-5",
    name: "Chicken Quesadilla",
    description: "Flour tortilla filled with grilled chicken, cheese, and peppers.",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Quesadillas",
    isAvailable: true,
  },
  {
    id: "item-17",
    restaurantId: "rest-5",
    name: "Nachos Supreme",
    description: "Tortilla chips topped with beans, cheese, guacamole, sour cream, and pico de gallo.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1580982327559-c1d459105a5b?q=80&w=3324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Sides",
    isAvailable: true,
  },
  
  // Curry House (rest-6) Menu Items
  {
    id: "item-18",
    restaurantId: "rest-6",
    name: "Butter Chicken",
    description: "Tender chicken in a creamy tomato sauce with Indian spices.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=3384&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Curries",
    isAvailable: true,
  },
  {
    id: "item-19",
    restaurantId: "rest-6",
    name: "Vegetable Biryani",
    description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Rice",
    isAvailable: true,
  },
  {
    id: "item-20",
    restaurantId: "rest-6",
    name: "Garlic Naan",
    description: "Soft bread with garlic and butter, baked in a tandoor oven.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1626100586348-1c6679d13eef?q=80&w=2929&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Bread",
    isAvailable: true,
  },
];

// Sample orders for vendor view
export const sampleOrders: Order[] = [
  {
    id: "order-1",
    customerName: "John Doe",
    items: [
      {
        menuItemId: "item-1",
        name: "Classic Cheeseburger",
        price: 8.99,
        quantity: 2,
      },
      {
        menuItemId: "item-4",
        name: "Sweet Potato Fries",
        price: 4.99,
        quantity: 1,
      },
    ],
    restaurantId: "rest-1",
    restaurantName: "The Campus Grill",
    status: "preparing",
    totalAmount: 22.97,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
    deliveryLocation: "Engineering Building, Room 302",
    estimatedDeliveryTime: "15-20 min",
  },
  {
    id: "order-2",
    customerName: "Jane Smith",
    items: [
      {
        menuItemId: "item-3",
        name: "Grilled Chicken Sandwich",
        price: 9.99,
        quantity: 1,
      },
    ],
    restaurantId: "rest-1",
    restaurantName: "The Campus Grill",
    status: "pending",
    totalAmount: 9.99,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    deliveryLocation: "Library, Study Room 5",
  },
  {
    id: "order-3",
    customerName: "Mike Johnson",
    items: [
      {
        menuItemId: "item-2",
        name: "BBQ Bacon Burger",
        price: 10.99,
        quantity: 1,
      },
      {
        menuItemId: "item-4",
        name: "Sweet Potato Fries",
        price: 4.99,
        quantity: 1,
      },
    ],
    restaurantId: "rest-1",
    restaurantName: "The Campus Grill",
    status: "delivered",
    totalAmount: 15.98,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    deliveryLocation: "Student Center, Main Hall",
    estimatedDeliveryTime: "Delivered",
  },
];
