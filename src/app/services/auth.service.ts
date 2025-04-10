import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginResponse, User } from '../models/product.model';

export interface LoginCredentials {
  email: string;
  password: string;
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
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  private userIdSubject = new BehaviorSubject<number | null>(null);
  private showAdminPopupSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('AuthService inicializado, isBrowser:', this.isBrowser);
    
    if (this.isBrowser) {
      const savedEmail = localStorage.getItem('userEmail');
      const savedRole = localStorage.getItem('userRole');
      const savedUserId = localStorage.getItem('userId');
      
      console.log('Verificando localStorage no navegador');
      console.log('Email:', savedEmail);
      console.log('Role:', savedRole);
      console.log('UserId:', savedUserId);
      
      if (savedEmail) {
        this.userEmailSubject.next(savedEmail);
      }
      if (savedRole) {
        this.userRoleSubject.next(savedRole);
        // Se o usuário for admin, marca para mostrar o popup
        if (savedRole === 'admin') {
          this.showAdminPopupSubject.next(true);
        }
      }
      if (savedUserId) {
        this.userIdSubject.next(Number(savedUserId));
      }
    }
  }

  login(email: string, role: string = 'client', userId?: number) {
    console.log(`Login chamado para email: ${email}, role: ${role}, userId: ${userId}`);
    
    if (this.isBrowser) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
      if (userId) {
        localStorage.setItem('userId', userId.toString());
        this.userIdSubject.next(userId);
      }
      this.userEmailSubject.next(email);
      this.userRoleSubject.next(role);
      
      // Se o usuário for admin, marca para mostrar o popup
      if (role === 'admin') {
        console.log('Usuário admin detectado, ativando popup');
        this.showAdminPopupSubject.next(true);
      } else {
        this.showAdminPopupSubject.next(false);
      }
    }
  }

  logout() {
    console.log('Realizando logout');
    if (this.isBrowser) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      this.userEmailSubject.next(null);
      this.userRoleSubject.next(null);
      this.userIdSubject.next(null);
      this.showAdminPopupSubject.next(false);
    }
  }

  getUserEmail(): Observable<string | null> {
    return this.userEmailSubject.asObservable();
  }

  getUserRole(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }
  
  getUserId(): Observable<number | null> {
    return this.userIdSubject.asObservable();
  }
  
  getCurrentUserId(): number | null {
    return this.userIdSubject.getValue();
  }

  isAdmin(): boolean {
    try {
      if (!this.isBrowser) {
        return false;
      }
      const role = localStorage.getItem('userRole');
      console.log('Verificando se é admin. Role:', role);
      return role === 'admin';
    } catch (error) {
      console.error('Erro ao verificar função isAdmin:', error);
      return false;
    }
  }
  
  getShouldShowAdminPopup(): Observable<boolean> {
    return this.showAdminPopupSubject.asObservable();
  }
  
  setShowAdminPopup(show: boolean): void {
    this.showAdminPopupSubject.next(show);
  }

  loginWithCredentials(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
