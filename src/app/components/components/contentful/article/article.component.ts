import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { IArticle } from '../models/contentful';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';

@Component({
  selector: 'lilly-content-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatDividerModule]
})
export class ArticleComponent {
  readonly article = input.required<IArticle>();
  private readonly helperService = inject(HelperService);

  goToLink(article: IArticle): void {
    this.helperService.goToLink(article?.fields?.url, LinkBehavior.SameTab);
  }
}


