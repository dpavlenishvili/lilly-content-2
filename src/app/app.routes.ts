import { Routes } from '@angular/router';
import { SeoPageKey } from '@careboxhealth/core';
import { moduleAccessGuard } from './guards/module-access.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full',
    canActivate: [moduleAccessGuard]
  },
  {
    path: 'modules',
    loadComponent: () => import('./components/modules/modules.component').then(m => m.ModulesComponent),
    canActivate: [moduleAccessGuard]
  },
  {
    path: 'article',
    loadComponent: () => import('./components/article/article.component').then(m => m.ArticleComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/error404/error404.component').then(m => m.ExtendedError404Component),
    data: {seoPageKey: SeoPageKey.NOT_FOUND}
  }
];

