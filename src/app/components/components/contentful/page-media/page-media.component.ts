import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MediaContentType } from '../media-content/media-content-type.enum';
import { IPageMediaFields } from '../models/contentful';
import { MediaContentService } from '../media-content/media-content.service';
import { MediaContentComponent } from '../media-content/media-content/media-content.component';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeroWrapperComponent } from '../../../shared-features/ui/hero-wrapper/hero-wrapper.component';
import { SectionWrapperModule } from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'lilly-page-media',
  templateUrl: './page-media.component.html',
  styleUrls: ['./page-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MediaContentComponent,
    MdToHtmlPipe,
    BreadcrumbComponent,
    HeroWrapperComponent,
    SectionWrapperModule,
    MatIcon
  ],
  standalone: true
})
export class PageMediaComponent {
  _pageMediaFields: IPageMediaFields;
  mediaId: string;
  readonly MediaContentType: typeof MediaContentType = MediaContentType;

    @Input()
  set pageMediaFields(value: IPageMediaFields) {
    this._pageMediaFields = value;
    this.mediaId = this.mediaContentService.getMediaIdByMediaType(value);
  }

    get pageMediaFields(): IPageMediaFields {
      return this._pageMediaFields;
    }

    constructor(private readonly mediaContentService: MediaContentService) {}

    get mediaTitle(): string {
      return `${this.pageMediaFields?.title || ''}`;
    }
}
