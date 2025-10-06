import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { IAccordionWidgetFields } from '../models/contentful';
import { MD_TO_HTML_PIPE_STRONG_CLASS, MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { SafeHtml } from '@angular/platform-browser';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lilly-accordion-widget',
  templateUrl: './accordion-widget.component.html',
  styleUrls: ['./accordion-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionPanel,
    NgClass,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MdToHtmlPipe
  ],
  standalone: true
})
export class AccordionWidgetComponent {
  @Input() accordionWidgetFields: IAccordionWidgetFields;
  @Input() isOpen = false;
  @Input() isFirst: boolean;

  @ViewChild('matExpansionPanel') matExpansionPanel: MatExpansionPanel;


  // For parsing html string to htmlElement
  elementForParsing: HTMLElement = document.createElement('div');

  checkTarget(event) {
    // We want cancel toggle panel when we click on strong with description and open only description
    if (event.target.className === MD_TO_HTML_PIPE_STRONG_CLASS) {
      this.matExpansionPanel.toggle();
    }
  }

  isFirstImage(html: SafeHtml): boolean {
    this.elementForParsing.innerHTML = html.toString();
    const element = this.elementForParsing?.children?.[0];
    return element?.children?.[0]?.tagName.toLowerCase() === 'img' && element.childNodes?.[0].nodeType === Node.ELEMENT_NODE;
  }
}
