import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/vitrine/vitrine.component').then(m => m.VitrineComponent)
  },
  {
    path: 'sacola',
    loadComponent: () => import('./features/public/sacola/sacola.component').then(m => m.SacolaComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/public/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivateChild: [authGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'estoque',
        loadComponent: () => import('./features/admin/estoque/estoque.component').then(m => m.EstoqueComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/pedidos/pedidos-admin.component').then(m => m.PedidosAdminComponent)
      }
    ]
  }
];
