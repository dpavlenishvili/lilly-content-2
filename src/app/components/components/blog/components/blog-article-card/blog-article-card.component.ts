import {Component, computed, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {IArticle} from '../../../contentful/models/contentful';
import {ClientRoutes} from '../../../../common/client-routes';
import {HelperService} from 'src/app/services/helper.service';
import {MatIcon} from '@angular/material/icon';
import {DatePipe, LocationStrategy, NgClass} from '@angular/common';
import {CbCardModule} from '../../../../shared-features/ui/components/cb-card/src/app/shared/card';
import {CbTagComponent} from '../../../../shared-features/ui/components/cb-tag/cb-tag.component';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'lilly-blog-article-card',
  templateUrl: './blog-article-card.component.html',
  styleUrls: ['./blog-article-card.component.scss'],
  imports: [
    MatIcon,
    NgClass,
    RouterLink,
    DatePipe,
    CbCardModule,
    CbTagComponent,
    MatButtonModule,
    CbTagComponent
  ],
  standalone: true
})
export class BlogArticleCardComponent {
  protected locationStrategy = inject(LocationStrategy);
  protected router = inject(Router);
  public helperService = inject(HelperService);

  readonly ClientRoutes = ClientRoutes;

  article = input<IArticle>();
  sliderArticleCard = input<boolean>(false);

  blogArticleLink = computed(
    () => this.locationStrategy.prepareExternalUrl(
      ClientRoutes.Blog + '/' + this.article()?.fields?.slug
    )
  );

  public navigateToArticle(slug: string): void {
    void this.router.navigate([`${ClientRoutes.Blog}/${slug}`]);
  }
}
