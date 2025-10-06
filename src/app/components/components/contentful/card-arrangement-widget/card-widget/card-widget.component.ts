import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { ICardWidgetFields } from '../../models/contentful';
import { ICmsAnalytics } from '../../models/cmsanalytics';
import { MediaContentType } from '../../media-content/media-content-type.enum';
import { MediaContentService } from '../../media-content/media-content.service';
import { NgClass, NgStyle, NgSwitch, NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MediaContentComponent } from '../../media-content/media-content/media-content.component';
import { MatAnchor } from '@angular/material/button';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-card-widget',
  templateUrl: './card-widget.component.html',
  styleUrls: ['./card-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    NgSwitch,
    NgStyle,
    MatIcon,
    MediaContentComponent,
    NgTemplateOutlet,
    MatAnchor,
    MdToHtmlPipe
  ],
  standalone: true
})
export class CardWidgetComponent {
  @Input() sectionshowTitle: boolean | undefined;
  @Input() set cardWidgetFields(fields: ICardWidgetFields) {
    this.widgetFields = fields;
    this.mediaId = this.getMediaIdByMediaType(fields);
  }

  @ViewChild('cardDescription') cardDescription: ElementRef;
  @ViewChild('cardImage') cardImage: ElementRef;
  get cardWidgetFields(): ICardWidgetFields {
    return this.widgetFields;
  }

  @Input() set cmsAnalytics(analytics: ICmsAnalytics) {
    this._cmsAnalytics = { ...analytics, diseaseID: this.helperService.getDiseaseIdsForAnalytics(analytics.diseaseID) };
  }

  _cmsAnalytics: ICmsAnalytics;
  get cmsAnalytics(): ICmsAnalytics {
    return this._cmsAnalytics;
  }

  mediaId: string;
  flipContentToggle = false;
  readonly MediaContentType: typeof MediaContentType = MediaContentType;
  private widgetFields: ICardWidgetFields;

  constructor(protected helperService: HelperService,
              public elementRef: ElementRef,
              private mediaContentService: MediaContentService) {}

  onflipContentToggle(): void {
    if (!this.cardWidgetFields?.flippable) { return; }
    this.helperService.sendAnalytics(this.cmsAnalytics, this.helperService.getActionNameByPageType(this.cmsAnalytics.pageType, 'ClickToFlip'));
    this.flipContentToggle = !this.flipContentToggle;
  }

  flipContentOnEnter(): void {
    this.onflipContentToggle();
    this.setFocusBasedOnCardSide();
  }

  setFocusBasedOnCardSide(): void {
    if (this.flipContentToggle) {
      this.cardDescription.nativeElement.focus();
    } else {
      this.cardImage.nativeElement.focus();
    }
  }

  public getMediaIdByMediaType(widgetFields: ICardWidgetFields): string {
    return this.mediaContentService.getMediaIdByMediaType(widgetFields);
  }
}
