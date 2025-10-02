import { Routes } from '@angular/router';
import { SeoPageKey } from '@careboxhealth/core';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'modules',
    loadComponent: () => import('./components/modules/modules.component').then(m => m.ModulesComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/error404/error404.component').then(m => m.ExtendedError404Component),
    data: {seoPageKey: SeoPageKey.NOT_FOUND}
  }
];

