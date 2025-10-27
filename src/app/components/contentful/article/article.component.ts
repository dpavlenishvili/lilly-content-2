import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { IArticle } from '../models/contentful';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import {CbCardModule} from '../../../shared-features/ui/components/cb-card/src/app/shared/card';
import {CbTagComponent} from '../../../shared-features/ui/components/cb-tag/cb-tag.component';

@Component({
  selector: 'lilly-content-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatDividerModule, CbCardModule, CbTagComponent]
})
export class ArticleComponent {
  readonly article = input.required<IArticle>();
  private readonly helperService = inject(HelperService);

  goToLink(article: IArticle): void {
    this.helperService.goToLink(article?.fields?.url, LinkBehavior.SameTab);
  }
}


