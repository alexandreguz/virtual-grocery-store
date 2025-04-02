import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getHeaders(): HttpHeaders {
    let token = '';
    if (this.isBrowser) {
      token = localStorage.getItem('token') || '';
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => console.log('Produtos carregados:', products)),
      catchError(error => {
        console.error('Erro ao carregar produtos:', error);
        return throwError(() => error);
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(error => {
        console.error(`Erro ao carregar produtos da categoria ${category}:`, error);
        return of([]);
      })
    );
  }


  addProduct(product: Omit<Product, 'id'> & { quantity: number }): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.post<Product>(this.apiUrl, product, { headers }).pipe(
      tap(newProduct => console.log('Produto adicionado:', newProduct)),
      catchError(error => {
        console.error('Erro ao adicionar produto:', error);
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { headers }).pipe(
      catchError(error => {
        console.error(`Erro ao atualizar produto ${id}:`, error);
        // Return observable instead of throwing to prevent unhandled rejections
        return of({ id, ...product } as Product);
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Erro ao excluir produto ${id}:`, error);
        // Return observable instead of throwing to prevent unhandled rejections
        return of(undefined);
      })
    );
  }
}