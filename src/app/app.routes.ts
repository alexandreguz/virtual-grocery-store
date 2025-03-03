// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter, Routes } from '@angular/router';
// import { importProvidersFrom } from '@angular/core';
// import { LoginComponent } from './components/login/login.component';

// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
// //   { path: '', redirectTo: '/login', pathMatch: 'full' }
// ];


import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { StoreComponent } from './components/store/store.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'store', component: StoreComponent }
];





  
