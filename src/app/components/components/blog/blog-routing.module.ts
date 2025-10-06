import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BlogComponent } from './blog.component';
import { BlogRoutesGuard } from '../../guards/blog-routes.guard';
import { ClientRoutesParams } from '../../common/client-routes-params';

const routes: Routes = [
  {
    path: '',
    component: BlogComponent,
    canActivateChild: [BlogRoutesGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/blog-articles/blog-articles.component').then(m => m.BlogArticlesComponent)
      },
      {
        path: 'meet-the-team',
        loadComponent: () => import('./pages/blog-team-about/blog-team-about.component').then(m => m.BlogTeamAboutComponent)
      },
      {
        path: 'author/:author-name',
        loadComponent: () => import('./pages/blog-author-about/blog-author-about.component').then(m => m.BlogAuthorAboutComponent)
      },
      {
        path: 'search/:search',
        loadComponent: () => import('./pages/blog-search/blog-search.component').then(m => m.BlogSearchComponent)
      },
      {
        path: `:${ClientRoutesParams.ArticleSlug}`,
        loadComponent: () => import('./pages/blog-article/blog-article.component').then(m => m.BlogArticleComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule {}
