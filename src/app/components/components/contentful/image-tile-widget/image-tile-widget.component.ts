import { Component, Input } from '@angular/core';
import { IImageTileWidgetFields } from '../models/contentful';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { SafeHtml } from '@angular/platform-browser';
import { ICmsAnalytics } from '../models/cmsanalytics';
import { MediaContentType } from '../media-content/media-content-type.enum';
import { MediaContentService } from '../media-content/media-content.service';
import { NgClass, NgStyle } from '@angular/common';
import { MediaContentComponent } from '../media-content/media-content/media-content.component';

@Component({
  selector: 'lilly-image-tile-widget',
  templateUrl: './image-tile-widget.component.html',
  styleUrls: ['./image-tile-widget.component.scss'],
  imports: [
    NgStyle,
    MediaContentComponent,
    NgClass
  ],
  standalone: true
})
export class ImageTileWidgetComponent {
  _imageTileWidgetFields: IImageTileWidgetFields;
  @Input()
  set imageTileWidgetFields(value: IImageTileWidgetFields) {
    this._imageTileWidgetFields = value;
    this.setDescription();
    this.mediaId = this.getMediaIdByMediaType(value);
  }

  get imageTileWidgetFields(): IImageTileWidgetFields {
    return this._imageTileWidgetFields;
  }

  @Input() isReverse = false;
  @Input() cmsAnalytics: ICmsAnalytics;

  description: SafeHtml;
  mediaId: string;
  readonly MediaContentType: typeof MediaContentType = MediaContentType;

  constructor(private mdToHtmlPipe: MdToHtmlPipe,
              private mediaContentService: MediaContentService) {}

  setDescription() {
    let text = `${this.imageTileWidgetFields?.description}`;

    if (!this.imageTileWidgetFields?.hideButton) {
      const { url, buttonText, linkBehavior, linkAriaLabel } = this.imageTileWidgetFields;
      text += ` <a href="${url}" aria-label="${linkAriaLabel}">${buttonText}</a>{linkBehavior="${linkBehavior}"}`;
    }

    this.description = this.mdToHtmlPipe.transform(text);
  }

  public getMediaIdByMediaType(widgetFields: IImageTileWidgetFields): string {
    return this.mediaContentService.getMediaIdByMediaType(widgetFields);
  }
}
