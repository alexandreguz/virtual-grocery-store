import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartComponent } from '../cart/cart.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, CartComponent, NavbarComponent, AddProductComponent],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {
  categories = ['Dairy', 'Vegetables', 'Meat, Fish & Eggs', 'Beverages', 'Fruits'];
  selectedCategory = this.categories[0];
  displayedProducts: Product[] = [];
  allProducts: Product[] = [];

  showAddProductPopup = false;
  private roleSubscription: Subscription | null = null;
  private isBrowser: boolean;

  constructor(
    private cartService: CartService, 
    public authService: AuthService, 
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private boundProductAddedHandler: any;

  ngOnInit() {
    console.log('StoreComponent inicializado');
    
    // Inicializar exibição mesmo sem produtos do servidor
    // Usando a lista hardcoded inicial
    this.displayedProducts = this.getProductsByCategory(this.selectedCategory);
    
    // Usar o observável específico para o popup admin
    this.roleSubscription = this.authService.getShouldShowAdminPopup().subscribe(shouldShow => {
      console.log('Deve mostrar popup admin?', shouldShow);
      this.showAddProductPopup = shouldShow;
    });

    // Também observa mudanças na role do usuário como backup
    this.authService.getUserRole().subscribe(role => {
      console.log('Role do usuário atualizada para:', role);
      if (role === 'admin') {
        this.showAddProductPopup = true;
      }
    });

    // Verificação adicional usando isAdmin (apenas no navegador)
    try {
      if (this.authService.isAdmin()) {
        console.log('Verificação direta: usuário é admin');
        this.showAddProductPopup = true;
        // Atualiza o BehaviorSubject também
        this.authService.setShowAdminPopup(true);
      }
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
    }

    // Tentar carregar produtos do servidor
    this.loadProducts();
    
    // Para garantir que pelo menos temos produtos iniciais visíveis
    if (this.displayedProducts.length === 0) {
      console.log('Não há produtos para exibir na categoria selecionada, mostrando todos os produtos');
      this.displayedProducts = [...this.allProducts];
    }
    
    // Adicionar listener para evento de produto adicionado
    // Armazenar referência à função vinculada para remoção adequada
    this.boundProductAddedHandler = this.handleProductAdded.bind(this);
    window.addEventListener('productAdded', this.boundProductAddedHandler);
  }
  
  handleProductAdded() {
    console.log('Evento de produto adicionado detectado');
    this.loadProducts();
  }
  
  loadProducts() {
    console.log('Carregando produtos do servidor');
    // Obter produtos do servidor em vez de usar a lista hardcoded
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Produtos carregados do servidor:', products);
        if (products && products.length > 0) {
          // Atualizar a lista de produtos
          this.allProducts = products;
          // Atualizar produtos exibidos da categoria atual
          this.displayedProducts = this.getProductsByCategory(this.selectedCategory);
          console.log('Produtos da categoria', this.selectedCategory, ':', this.displayedProducts);
        } 
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        // // Usar os dados locais como fallback em caso de erro
        // this.selectCategory(this.selectedCategory);
      }
    });
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }

    if (this.isBrowser && this.boundProductAddedHandler) {
      window.removeEventListener('productAdded', this.boundProductAddedHandler);
    }
  }

  selectCategory(category: string) {
    console.log('Selecionando categoria:', category);
    this.selectedCategory = category;
    this.displayedProducts = this.getProductsByCategory(category);
    console.log('Produtos filtrados:', this.displayedProducts);
  }

  getProductsByCategory(category: string): Product[] {
    if (!this.allProducts || this.allProducts.length === 0) {
      console.log('Array de produtos vazio ou indefinido');
      return [];
    }
    
    // Verificar e imprimir todas as categorias disponíveis para depuração
    const availableCategories = [...new Set(this.allProducts.map(p => p.category))];
    console.log('Categorias disponíveis:', availableCategories);
    
    // Comparação case-insensitive e mais flexível
    const filteredProducts = this.allProducts.filter(p => {
      if (!p.category) {
        console.log('Produto sem categoria:', p);
        return false;
      }
      
      // Comparação exata
      const exactMatch = p.category === category;
      
      // Comparação case-insensitive
      const caseInsensitiveMatch = p.category.toLowerCase() === category.toLowerCase();
      
      // Comparação parcial (contém a categoria)
      const partialMatch = p.category.toLowerCase().includes(category.toLowerCase()) || 
                          category.toLowerCase().includes(p.category.toLowerCase());
      
      // Log detalhado para depuração
      if (partialMatch && !exactMatch) {
        console.log(`Correspondência parcial encontrada: '${p.category}' ~ '${category}'`);
      }
      
      return exactMatch || caseInsensitiveMatch || partialMatch;
    });
    
    console.log(`Filtrando produtos por categoria '${category}':`, filteredProducts);
    return filteredProducts;
  }

  addToCart(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    });
  }

  closeAddProductPopup() {
    console.log('Fechando popup');
    this.showAddProductPopup = false;
    this.authService.setShowAdminPopup(false);
  }

  openAddProductPopup() {
    console.log('Abrindo popup');
    this.showAddProductPopup = true;
    this.authService.setShowAdminPopup(true);
  }
  
  isUserAdmin(): boolean {
    try {
      return this.authService.isAdmin();
    } catch (error) {
      console.error('Erro ao verificar admin no template:', error);
      return false;
    }
  }
  
  getImagePath(imageName: string): string {
    // Verifica se a imagem já tem um caminho completo (começa com http ou /)
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }
    // Caso contrário, adiciona o caminho para a pasta public
    return `/${imageName}`;
  }
}