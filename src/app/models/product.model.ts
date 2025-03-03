export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    quantity?: number; // Opcional, usado apenas no carrinho
  }
  