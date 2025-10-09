import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  CstContentSlotDirective,
  CstHeaderContentSlotDirective,
  CstLabelSlotDirective,
  CstTitleSlotDirective
} from './cst-slots';
import {ContainerWrapperComponent} from './container-wrapper/container-wrapper.component';

@Component({
  selector: 'cst-wrapper',
  standalone: true,
  imports: [
    NgClass,
    CstContentSlotDirective,
    CstHeaderContentSlotDirective,
    CstLabelSlotDirective,
    CstTitleSlotDirective,
    ContainerWrapperComponent
  ],
  templateUrl: './section-wrapper.component.html',
  styleUrls: ['./section-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class SectionWrapperComponent {
  @Input() showTitle = true;
  @Input() showHeaderContent = true;
  @Input() hostClass: string = 'cst--custom';
  @Input() hostSizeClass: string = 'cst--lg';
  @Input() titleClass: string = 'garamond-heading-1-font';
  @Input() gridClass: string = 'is-narrow';
  @Input() containerClass: string = 'container';
  @HostBinding('class')
  get hostClasses(): string {
    return `cst${this.hostClass ? ' ' + this.hostClass : ''}${this.hostSizeClass ? ' ' + this.hostSizeClass : ''}`;
  }
}
