import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model'; // Agora a interface existe!

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: Product[] = [];
  private cartTotal = new BehaviorSubject<number>(0);
  cartTotal$ = this.cartTotal.asObservable();

  private cart = new BehaviorSubject<Product[]>([]);
  cart$ = this.cart.asObservable();

  addToCart(product: Product) {
    const itemIndex = this.cartItems.findIndex((item) => item.id === product.id);
    if (itemIndex !== -1) {
      this.cartItems[itemIndex].quantity! += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
    this.updateCart();
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter((item) => item.id !== productId);
    this.updateCart();
  }

  updateCart() {
    this.cart.next([...this.cartItems]);
    this.cartTotal.next(this.getTotalPrice());
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  }

  clearCart() {
    this.cartItems = [];
    this.updateCart();
  }
}
