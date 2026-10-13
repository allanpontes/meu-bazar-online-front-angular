import { Routes } from '@angular/router';

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
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'estoque',
        loadComponent: () => import('./features/admin/estoque/estoque.component').then(m => m.EstoqueComponent)
      }
    ]
  }
];
