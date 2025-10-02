import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
import { IAccordionWidgetFields } from '../models/contentful';
import { MD_TO_HTML_PIPE_STRONG_CLASS, MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { NgClass } from '@angular/common';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';

@Component({
  selector: 'lilly-content-accordion-widget',
  templateUrl: './accordion-widget.component.html',
  styleUrls: ['./accordion-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionPanel,
    NgClass,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    ImageTileWidgetComponent,
    MdToHtmlPipe
  ],
  standalone: true
})
export class AccordionWidgetComponent {
  readonly accordionWidgetFields = input.required<IAccordionWidgetFields>();
  readonly isFirst = input<boolean>(false);

  readonly matExpansionPanel = viewChild.required<MatExpansionPanel>('matExpansionPanel');

  readonly hasBody = computed(() => !!this.accordionWidgetFields()?.body);
  readonly hasContent = computed(() => !!this.accordionWidgetFields()?.content?.length);

  checkTarget(event: MouseEvent): void {
    // We want cancel toggle panel when we click on strong with description and open only description
    const target = event.target as HTMLElement;
    if (target?.className === MD_TO_HTML_PIPE_STRONG_CLASS) {
      this.matExpansionPanel()?.toggle();
    }
  }
}