import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from '../../services/auth.service';

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  number: number = 321;
  orders: number = 23

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    this.authService.loginWithCredentials({ email: this.email, password: this.password }).subscribe({
      next: (response: LoginResponse) => {
        localStorage.setItem('token', response.token);
        alert('Login bem-sucedido!');
        this.router.navigate(['/store']);
      },
      error: (error: any) => {
        alert('Erro no login!');
      }
    });
  }
}

