import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/demo/demo.component').then(m => m.DemoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
