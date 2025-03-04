
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

export interface StudentUser {
  id: string;
  phone: string;
  name: string;
  createdAt: string;
}
