import {Component,  HostBinding, ChangeDetectionStrategy, input} from '@angular/core';
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

  showTitle= input<boolean>(true);
  showHeaderContent= input<boolean>(true);

  hostClass = input<string>('cst--custom');
  hostSizeClass = input<string>('cst--lg');

  titleClass = input<string>('garamond-heading-1-font');
  headerGridClass = input<string>('is-narrow');
  containerClass = input<string>('container');

  showLabel= input<boolean>(true);
  @HostBinding('class')
  get hostClasses(): string {
    return `cst${this.hostClass() ? ' ' + this.hostClass() : ''}${this.hostSizeClass() ? ' ' + this.hostSizeClass() : ''}`;
  }
}
