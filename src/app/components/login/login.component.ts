import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/product.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  number: number = 321;
  orders: number = 23

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    console.log('Tentando login com:', this.email);
    
    this.authService.loginWithCredentials({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        console.log('Resposta do login:', response);
        
        // Verificar se a resposta contém informações do usuário
        if (response.user && response.user.role) {
          console.log('Role do usuário na resposta:', response.user.role);
          console.log('ID do usuário na resposta:', response.user.id);
          this.authService.login(this.email, response.user.role, response.user.id);
          console.log('Usuário logado com role:', response.user.role);
          
          // Salvar o token no localStorage
          if (response.token) {
            localStorage.setItem('token', response.token);
            console.log('Token salvo no localStorage');
          }
        } else {
          console.log('Resposta não contém role, usando client como padrão');
          this.authService.login(this.email);
        }
        
        // Verificação adicional para testes - forçar admin para email específico
        // REMOVER EM PRODUÇÃO
        if (this.email === 'admin@example.com') {
          console.log('Usuário admin detectado, definindo role como admin');
          this.authService.login(this.email, 'admin');
        }
        
        alert('Login bem-sucedido!');
        this.router.navigate(['/store']);
      },
      error: (error: any) => {
        console.error('Erro no login:', error);
        alert('Erro no login!');
      }
    });
  }
}

