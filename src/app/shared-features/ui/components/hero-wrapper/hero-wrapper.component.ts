import {ChangeDetectionStrategy, Component, Directive, Input} from '@angular/core';
import { NgClass } from '@angular/common';
@Directive({ selector: '[footer]', standalone: true })
export class HeroFooterDirective {}
@Component({
  selector: 'hero-wrapper',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './hero-wrapper.component.html',
  styleUrl: './hero-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroWrapperComponent {
  @Input() wrapClass = '';
}
