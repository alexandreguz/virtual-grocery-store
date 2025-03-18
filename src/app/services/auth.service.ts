
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userEmailSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      this.userEmailSubject.next(savedEmail);
    }
  }

  login(email: string) {
    localStorage.setItem('userEmail', email);
    this.userEmailSubject.next(email);
  }

  logout() {
    localStorage.removeItem('userEmail');
    this.userEmailSubject.next(null);
  }

  getUserEmail(): Observable<string | null> {
    return this.userEmailSubject.asObservable();
  }

  loginWithCredentials(credentials: LoginCredentials): Observable<LoginResponse> {
    // Simulação de login bem-sucedido
    return of({ token: 'fake-jwt-token' });
  }
}
