import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  categories = ['Milk & Eggs', 'Vegetables', 'Meat & Fish', 'Beverages', 'Fruits'];
  selectedCategory = this.categories[0];
  displayedProducts: Product[] = [];
  allProducts: Product[] = [
    { id: 1, name: 'Milk', price: 5, image: 'milk.webp', category: 'Milk & Eggs' },
    { id: 2, name: 'Eggs', price: 3, image: 'eggs.jpeg', category: 'Milk & Eggs' },
    { id: 3, name: 'Chicken', price: 10, image: 'chicken.jpeg', category: 'Meat & Fish' },
    { id: 4, name: 'Soya Milk', price: 7, image: 'soyamilk.jpg', category: 'Milk & Eggs' },
    { id: 7, name: 'Carrot', price: 1, image: 'carrot.jpg', category: 'Vegetables' },
    { id: 5, name: 'Tomato', price: 2, image: 'tomato.jpg', category: 'Vegetables' },
    { id: 6, name: 'Potato', price: 1, image: 'potato.jpeg', category: 'Vegetables' },
    { id: 8, name: 'Onion', price: 1, image: 'onion.jpeg', category: 'Vegetables' },
    { id: 9, name: 'Garlic', price: 1, image: 'garlic.jpeg', category: 'Vegetables' },
    { id: 10, name: 'Banana', price: 1, image: 'banana.jpg', category: 'Fruits' },
    { id: 11, name: 'Apple', price: 1, image: 'apple.jpeg', category: 'Fruits' },
    { id: 12, name: 'Orange', price: 1, image: 'orange.jpeg', category: 'Fruits' },
    { id: 13, name: 'Pineapple', price: 1, image: 'pineapple.jpeg', category: 'Fruits' },
    { id: 14, name: 'Strawberry', price: 1, image: 'strawberry.jpg', category: 'Fruits' },
    { id: 15, name: 'Grapes', price: 1, image: 'grapes.jpg', category: 'Fruits' },
    { id: 16, name: 'Coca-Cola', price: 1, image: 'cola.png', category: 'Beverages' },
    { id: 17, name: 'Water', price: 2, image: 'water.jpg', category: 'Beverages' },
    { id: 18, name: 'Soda', price: 3, image: 'soda.jpg', category: 'Beverages' },
    { id: 19, name: 'Beer', price: 11, image: 'beer.jpg', category: 'Beverages' },
    { id: 20, name: 'Wine', price: 41, image: 'wine.jpg', category: 'Beverages' },
    { id: 21, name: 'Whiskey', price: 31, image: 'whiskey.jpeg', category: 'Beverages' },
    { id: 22, name: 'Vodka', price: 21, image: 'vodka.jpg', category: 'Beverages' },
    { id: 23, name: 'Jack Daniels', price: 23, image: 'jackdaniels.jpg', category: 'Beverages' },
    { id: 24, name: 'Fanta', price: 3, image: 'fanta.jpg', category: 'Beverages' },
    { id: 25, name: 'Sprite', price: 3, image: 'sprite.jpg', category: 'Beverages' },
    { id: 26, name: 'Pepsi', price: 3, image: 'pepsi-can.jpg', category: 'Beverages' },
    { id: 27, name: '7up', price: 3, image: '7up.webp', category: 'Beverages' },
    { id: 32, name: 'Tuna', price: 4, image: 'tuna.jpg', category: 'Meat & Fish' },
    { id: 33, name: 'Salmon', price: 19, image: 'salmon.jpg', category: 'Meat & Fish' },
    { id: 34, name: 'Beef', price: 15, image: 'beef.jpeg', category: 'Meat & Fish' },
    { id: 35, name: 'Cheese', price: 10, image: 'cheese.jpg', category: 'Milk & Eggs' },
    { id: 36, name: 'Butter', price: 3, image: 'butter.webp', category: 'Milk & Eggs' },
    { id: 37, name: 'Yogurt', price: 7, image: 'yogurt.webp', category: 'Milk & Eggs' },
    { id: 38, name: 'Ice Cream', price: 8, image: 'ice-cream.jpeg', category: 'Milk & Eggs' },
  ];

  showAddProductPopup = false;
  private roleSubscription: Subscription | null = null;

  constructor(
    private cartService: CartService, 
    public authService: AuthService,  // Alterado para public para acessar no template
    private productService: ProductService
  ) {}

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
        } else {
          console.log('Nenhum produto recebido do servidor, usando dados locais');
          // Usar os dados locais como fallback
          this.selectCategory(this.selectedCategory);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        // Usar os dados locais como fallback em caso de erro
        this.selectCategory(this.selectedCategory);
      }
    });
  }

  ngOnDestroy() {
    // Limpar inscrições
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
    
    // Remover event listeners usando a mesma referência de função
    if (this.boundProductAddedHandler) {
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