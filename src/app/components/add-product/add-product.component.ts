import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  @Output() close = new EventEmitter<void>();
  
  product: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    image: '',
    category: 'Fruits',
    quantity: 0 
  };
  
  categories = ['Dairy', 'Vegetables', 'Meat, Fish & Eggs', 'Beverages', 'Fruits'];
  successMessage = '';
  errorMessage = '';
  
  constructor(private productService: ProductService) {}
  
  onSubmit() {
    console.log('Enviando produto:', this.product);
    
    // Validação básica
    if (!this.product.name || !this.product.category || this.product.price <= 0 || !this.product.image) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      return;
    }
    
    // Verificar se a imagem tem extensão
    if (!this.product.image.includes('.')) {
      this.errorMessage = 'Nome da imagem deve incluir a extensão (ex: produto.jpg)';
      return;
    }
    
    // Criar uma cópia do produto para enviar ao servidor
    const productToSend = { ...this.product };
    
    this.productService.addProduct(productToSend).subscribe({
      next: (response) => {
        console.log('Resposta do servidor:', response);
        this.successMessage = `Produto ${this.product.name} adicionado com sucesso!`;
        this.errorMessage = '';
        
        // Notificar o componente pai para atualizar a lista de produtos
        window.dispatchEvent(new CustomEvent('productAdded'));
        
        // Limpa o formulário após sucesso
        this.product = {
          name: '',
          price: 0,
          image: '',
          category: 'Fruits',
          quantity: 0
        };
        
        // Fechar o popup após 2 segundos
        setTimeout(() => {
          this.closePopup();
        }, 2000);
      },
      error: (error) => {
        console.error('Erro ao adicionar produto:', error);
        this.errorMessage = 'Erro ao adicionar produto: ' + 
          (error.error?.message || error.statusText || error.message || 'Erro desconhecido');
        this.successMessage = '';
      }
    });
  }
  
  closePopup() {
    this.close.emit();
  }
}