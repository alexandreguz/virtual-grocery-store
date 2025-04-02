import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StoreComponent } from './components/store/store.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'store', component: StoreComponent },
  { path: 'signup', component: SignupComponent },
];





  
