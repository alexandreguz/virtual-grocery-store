import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent {
  categories = ['Milk & Eggs', 'Vegetables', 'Meat & Fish', 'Beverages', 'Fruits'];
  selectedCategory = this.categories[0];
  displayedProducts: Product[] = [];
  allProducts: Product[] = [
    { id: 1, name: 'Milk', price: 5, image: 'milk.webp', category: 'Milk & Eggs' },
    { id: 2, name: 'Eggs', price: 3, image: 'eggs.jpeg', category: 'Milk & Eggs' },
    { id: 3, name: 'Chicken', price: 10, image: 'chicken.jpeg', category: 'Meat & Fish' },
    { id: 4, name: 'Soya Milk', price: 7, image: 'soyamilk.jpg', category: 'Milk & Eggs' },
    { id: 7, name: 'Carrot', price: 1, image: 'carrot.jpg', category: 'Vegetables' },
    { id: 5, name: 'Tomato', price: 2, image: 'tomato.jpg', category: 'Vegetables' },
    { id: 6, name: 'Potato', price: 1, image: 'potato.jpeg', category: 'Vegetables' },
    { id: 8, name: 'Onion', price: 1, image: 'onion.jpeg', category: 'Vegetables' },
    { id: 9, name: 'Garlic', price: 1, image: 'garlic.jpeg', category: 'Vegetables' },
    { id: 10, name: 'Banana', price: 1, image: 'banana.jpg', category: 'Fruits' },
    { id: 11, name: 'Apple', price: 1, image: 'apple.jpeg', category: 'Fruits' },
    { id: 12, name: 'Orange', price: 1, image: 'orange.jpeg', category: 'Fruits' },
    { id: 13, name: 'Pineapple', price: 1, image: 'pineapple.jpeg', category: 'Fruits' },
    { id: 14, name: 'Strawberry', price: 1, image: 'strawberry.jpg', category: 'Fruits' },
    { id: 15, name: 'Grapes', price: 1, image: 'grapes.jpg', category: 'Fruits' },
    { id: 16, name: 'Coca-Cola', price: 1, image: 'cola.png', category: 'Beverages' },
    { id: 17, name: 'Water', price: 2, image: 'water.jpg', category: 'Beverages' },
    { id: 18, name: 'Soda', price: 3, image: 'soda.jpg', category: 'Beverages' },
    { id: 19, name: 'Beer', price: 11, image: 'beer.jpg', category: 'Beverages' },
    { id: 20, name: 'Wine', price: 41, image: 'wine.jpg', category: 'Beverages' },
    { id: 21, name: 'Whiskey', price: 31, image: 'whiskey.jpeg', category: 'Beverages' },
    { id: 22, name: 'Vodka', price: 21, image: 'vodka.jpg', category: 'Beverages' },
    { id: 23, name: 'Jack Daniels', price: 23, image: 'jackdaniels.jpg', category: 'Beverages' },
    { id: 24, name: 'Fanta', price: 3, image: 'fanta.jpg', category: 'Beverages' },
    { id: 25, name: 'Sprite', price: 3, image: 'sprite.jpg', category: 'Beverages' },
    { id: 26, name: 'Pepsi', price: 3, image: 'pepsi-can.jpg', category: 'Beverages' },
    { id: 27, name: '7up', price: 3, image: '7up.webp', category: 'Beverages' },
    { id: 32, name: 'Tuna', price: 4, image: 'tuna.jpg', category: 'Meat & Fish' },
    { id: 33, name: 'Salmon', price: 19, image: 'salmon.jpg', category: 'Meat & Fish' },
    { id: 34, name: 'Beef', price: 15, image: 'beef.jpeg', category: 'Meat & Fish' },
    { id: 35, name: 'Cheese', price: 10, image: 'cheese.jpg', category: 'Milk & Eggs' },
    { id: 36, name: 'Butter', price: 3, image: 'butter.webp', category: 'Milk & Eggs' },
    { id: 37, name: 'Yogurt', price: 7, image: 'yogurt.webp', category: 'Milk & Eggs' },
    { id: 38, name: 'Ice Cream', price: 8, image: 'ice-cream.jpeg', category: 'Milk & Eggs' },
  ];

  constructor(private cartService: CartService) {}

  selectCategory(category: string) {
    this.displayedProducts = this.allProducts.filter(p => p.category === category);
  }

  addToCart(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    });
  }
}