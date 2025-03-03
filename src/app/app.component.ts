import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { CartComponent } from "./components/cart/cart.component";
import { StoreComponent } from "./components/store/store.component";
import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CartComponent, StoreComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'virtual-grocery-store';
}
