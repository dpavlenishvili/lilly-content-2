import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MediaContentType } from '../media-content/media-content-type.enum';
import { IPageFields } from '../models/contentful';
import { MediaContentService } from '../media-content/media-content.service';
import { MediaContentComponent } from '../media-content/media-content/media-content.component';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeroWrapperComponent } from '../../../shared-features/ui/hero-wrapper/hero-wrapper.component';

@Component({
  selector: 'lilly-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MediaContentComponent,
    MdToHtmlPipe,
    BreadcrumbComponent,
    HeroWrapperComponent
  ],
  standalone: true
})
export class HeroSectionComponent {
  _pageFields: IPageFields;
  mediaId: string;
  readonly MediaContentType: typeof MediaContentType = MediaContentType;

  @Input() noIntro: boolean;

  @Input()
  set pageFields(value: IPageFields) {
    this._pageFields = value;
    this.mediaId = this.mediaContentService.getMediaIdByMediaType(value);
  }

  get pageFields(): IPageFields {
    return this._pageFields;
  }

  constructor(private readonly mediaContentService: MediaContentService) {
  }

  get mediaTitle(): string {
    return `Hero section - ${this.pageFields?.metadata?.fields?.metaTitle || ''}`;
  }
}
