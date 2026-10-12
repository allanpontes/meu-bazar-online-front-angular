import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/vitrine/vitrine.component').then(m => m.VitrineComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];
