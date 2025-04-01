import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => console.log('Resposta original da API:', response)),
      map(response => {
        // Se a resposta for um array, retorne-o diretamente
        if (Array.isArray(response)) {
          return response;
        }
        // Se a resposta estiver em um formato diferente, tente extrair os produtos
        else if (response && response.products) {
          return response.products;
        }
        // Caso contrário, verifique se é um objeto e converta para array
        else if (response && typeof response === 'object') {
          // Alguns backends retornam objetos em vez de arrays
          return Object.values(response);
        }
        return [];
      }),
      tap(products => console.log('Produtos processados:', products)),
      catchError(error => {
        console.error('Erro ao carregar produtos:', error);
        return of([]);
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

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.post<Product>(this.apiUrl, product, { headers }).pipe(
      tap(newProduct => console.log('Produto adicionado:', newProduct)),
      catchError(error => {
        console.error('Erro ao adicionar produto:', error);
        // Return observable instead of throwing to prevent unhandled rejections
        return of({ id: 0, name: '', price: 0, image: '', category: '' } as Product);
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