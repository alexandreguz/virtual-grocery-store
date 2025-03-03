import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems: any[] = [];
  total: number = 0;

  constructor(private cartService: CartService) {
    this.cartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.total = this.cartService.getTotalPrice();
    });
  }

  order() {
    console.log('Ordering...');
    alert('Proceeding to payment...');
  }
}
