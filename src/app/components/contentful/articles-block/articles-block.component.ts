import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IArticlesBlockFields, IButton } from '../models/contentful';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelperService } from '../../../services/helper.service';
import { ArticleComponent } from '../article/article.component';

@Component({
  selector: 'lilly-content-articles-block',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ArticleComponent],
  templateUrl: './articles-block.component.html',
  styleUrls: ['./articles-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesBlockComponent {
  readonly articlesBlockFields = input.required<IArticlesBlockFields>();
  readonly fields = computed(() => this.articlesBlockFields());
  private readonly helperService = inject(HelperService);

  goToLink(button: IButton): void {
    this.helperService.goToLink(button?.fields?.link, button.fields.linkBehavior);
  }
}



