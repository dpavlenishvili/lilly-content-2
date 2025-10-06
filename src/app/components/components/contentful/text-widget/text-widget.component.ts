import {ChangeDetectionStrategy, Component, ElementRef, Input} from '@angular/core';
import {ITextWidgetFields} from '../models/contentful';
import {ICmsAnalytics} from '../models/cmsanalytics';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { NgClass } from '@angular/common';


@Component({
  selector: 'lilly-text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MdToHtmlPipe,
    NgClass
  ],
  standalone: true
})
export class TextWidgetComponent {
  @Input() textWidgetFields: ITextWidgetFields;
  @Input() cmsAnalytics: ICmsAnalytics;

  constructor(public elementRef: ElementRef) {}
}
