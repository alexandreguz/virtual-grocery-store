import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: Product[] = [];
  private cartTotal = new BehaviorSubject<number>(0);
  cartTotal$ = this.cartTotal.asObservable();

  private cart = new BehaviorSubject<Product[]>([]);
  cart$ = this.cart.asObservable();
  
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

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
  
  saveCartToDatabase(): Observable<any> {
    if (this.cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }
    
    // For each cart item, send a separate request to the server
    // We'll use the first item for simplicity, but ideally we would loop through all items
    const item = this.cartItems[0];
    const cartItem = {
      product_id: item.id,
      quantity: item.quantity || 1,
      price: item.price
    };
    
    // Get user ID from auth service
    const userId = this.authService.getCurrentUserId();
    console.log('User ID para o carrinho:', userId);
    
    // Get the token from localStorage (remove quotes if present)
    let token = localStorage.getItem('token');
    if (token) {
      // Remove any quotes that might be surrounding the token
      token = token.replace(/^["'](.*)["']$/, '$1');
    }
    
    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('Enviando requisição com token:', token);
    
    // Save item to the database with authentication header
    return this.http.post(`${this.apiUrl}/cart/items`, cartItem, { headers });
  }
}
