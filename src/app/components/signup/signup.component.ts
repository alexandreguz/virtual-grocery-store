import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule],
})
export class SignupComponent {
  step = 1;

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

  constructor(private router: Router) {}

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
      alert('Please fill all fields correctly.');
    }
  }

  submit() {
    console.log(this.user);
    this.router.navigate(['/store']);
  }
}
