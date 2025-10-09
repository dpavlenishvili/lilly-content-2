import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IArticlePage } from '../contentful/models/contentful';

@Component({
  selector: 'lilly-content-article',
  templateUrl: './article.component.html',
  styleUrls: ['article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: []
})
export class ArticleComponent {
  private readonly contentful = inject(ExtendedContentfulService);
  readonly articlePage = toSignal<IArticlePage | null>(
    this.contentful.getEntryByKey<IArticlePage>('articlePage', 'article-page'),
    { initialValue: null }
  );
}
