import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  number: number = 321;
  orders: number = 23

  constructor(private router: Router) {}

  onSubmit() {
    if (this.username === 'user' && this.password === 'password') {
      localStorage.setItem('user', this.username);
      this.router.navigate(['/store']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}

