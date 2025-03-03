import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  cartItems: Product[] = [];
  cartTotal: number = 0;
  checkoutMode = false;

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
    alert('Order placed successfully!');
    this.cartService.clearCart();
    this.checkoutMode = false;
  }
}
