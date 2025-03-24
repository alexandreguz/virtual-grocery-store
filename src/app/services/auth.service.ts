
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
    const apiUrl = 'http://localhost:3000/api/auth/login';
    
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    
    return new Observable<LoginResponse>((observer) => {
      fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(credentials)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(data => {
        observer.next({ token: data.token });
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }
}