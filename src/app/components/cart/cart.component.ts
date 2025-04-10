import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, HttpClientModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cartItems: Product[] = [];
  cartTotal: number = 0;
  checkoutMode = false;
  orderProcessing = false;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  toggleCheckout() {
    this.checkoutMode = !this.checkoutMode;
  }

  finalizeOrder() {
    this.orderProcessing = true;
    
    // Save cart items to database
    this.cartService.saveCartToDatabase().subscribe({
      next: (response) => {
        console.log('Cart saved to database:', response);
        alert('Order placed successfully!');
        this.cartService.clearCart();
        this.checkoutMode = false;
        this.orderProcessing = false;
      },
      error: (error) => {
        console.error('Error saving cart:', error);
        alert('Error placing order. Please try again.');
        this.orderProcessing = false;
      }
    });
  }
}
