export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity?: number; // Opcional, usado apenas no carrinho
}

export interface User {
  id?: number;
  email: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
