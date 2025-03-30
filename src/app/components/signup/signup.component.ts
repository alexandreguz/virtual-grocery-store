import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule,],
})
export class SignupComponent {
  step = 1;
  errorMessage: string | null = null;

  user = {
    id: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    street: '',
    name: '',
    lastName: ''
  };

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  nextStep() {
    if (
      this.user.id &&
      this.user.email &&
      this.user.password &&
      this.user.confirmPassword &&
      this.user.password === this.user.confirmPassword
    ) {
      this.step = 2;
    } else {
      this.errorMessage = 'Please fill all fields correctly.';
    }
  }

  submit() {
    this.errorMessage = null;
    const { id, email, password, city, street, name, lastName } = this.user;
    const userData = {
      identity_number: id,
      email,
      password,
      city,
      street,
      first_name: name,
      last_name: lastName,
    };
  
    this.authService.register(userData).subscribe({
      next: (response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.authService.login(email);
  
          alert('Registration and login sucesfull!');
          this.router.navigate(['/store']);
        } else {
          alert('Error. Make Login manually');
        }
      },
      error: (error) => {
        console.error('Error in registration:', error);
        this.errorMessage = error.status === 400 && error.error.message
          ? error.error.message
          : 'Error at registration.';
      },
    });
  }
  
}
