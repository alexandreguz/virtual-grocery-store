import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userEmail: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe(email => {
      this.userEmail = email;
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.authService.logout();
    this.userEmail = null;
    this.router.navigate(['/login']);
  }
}
