import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtendedContentfulService } from '../../../services/contentful.service';
import { IStaticPageFields } from '../models/contentful';
import { Document } from '@contentful/rich-text-types';
import { map, switchMap } from 'rxjs/operators';
import { EntryCollection } from 'contentful';
import { ActivatedRoute } from '@angular/router';
import { GlobalSeoService } from '@careboxhealth/core';
import { StaticPageFooterComponent } from './static-page-footer/static-page-footer.component';
import { AsyncPipe } from '@angular/common';
import { RichTextToHtmlPipe } from '../../../pipes/rich-text-to-html.pipe';

@Component({
  selector: 'lilly-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StaticPageFooterComponent,
    AsyncPipe,
    RichTextToHtmlPipe
  ],
  standalone: true
})
export class StaticPageComponent {

  content$: Observable<Document>;

  constructor(
    protected contentfulService: ExtendedContentfulService,
    protected route: ActivatedRoute,
    protected seo: GlobalSeoService,
  ) {
    this.content$ = this.route.data.pipe(switchMap(data => {
      return (this.contentfulService.getEntries({
        content_type: 'staticPage',
        'fields.key': data.staticPageKey,
      }) as Observable<EntryCollection<IStaticPageFields>>).pipe(
        map(pages => {
          const metadata = pages.items[0]?.fields?.metadata;
          if (metadata) {
            this.contentfulService.applyPageMetadata(metadata);
          }
          return pages.items[0]?.fields.pageContent;
        })
      );
    }));
  }

}
