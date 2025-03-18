import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userEmail: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe(email => {
      this.userEmail = email;
    });
  }

  logout() {
    this.authService.logout();
    this.userEmail = null; 
  }
}
