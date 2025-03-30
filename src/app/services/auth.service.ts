import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterData {
  identity_number: string;
  email: string;
  password: string;
  city: string;
  street: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  private isBrowser: boolean;
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        this.userEmailSubject.next(savedEmail);
      }
    }
  }

  login(email: string) {
    if (this.isBrowser) {
      localStorage.setItem('userEmail', email);
      this.userEmailSubject.next(email);
    }
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('token');
      this.userEmailSubject.next(null);
    }
  }

  getUserEmail(): Observable<string | null> {
    return this.userEmailSubject.asObservable();
  }

  loginWithCredentials(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
