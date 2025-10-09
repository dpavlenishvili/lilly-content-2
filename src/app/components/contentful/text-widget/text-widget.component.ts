import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { ITextWidgetFields } from '../models/contentful';
import {
  ContainerWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/container-wrapper/container-wrapper.component';

@Component({
  selector: 'lilly-text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MdToHtmlPipe,
    NgClass,
    ContainerWrapperComponent
  ],
  standalone: true
})
export class TextWidgetComponent {
  readonly textWidgetFields = input.required<ITextWidgetFields>();
  readonly elementRef = inject(ElementRef);

  readonly textAlignment = computed(() => ({
    'text-left': !this.textWidgetFields()?.textAlign,
    'text-center': this.textWidgetFields()?.textAlign
  }));
}
