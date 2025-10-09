import {ChangeDetectionStrategy, Component, Input, input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'container-wrapper',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './container-wrapper.component.html',
  styleUrl: './container-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerWrapperComponent {
  wrapped = input<boolean>(true);
  @Input() gridClass: string = 'is-narrow';
  @Input() containerClass: string = 'container';
}
