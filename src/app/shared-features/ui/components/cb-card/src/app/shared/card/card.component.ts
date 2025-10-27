import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'cb-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CbCardComponent {
  /** Optional extra classes to add on top of 'cb-card' */
  @Input() cardClass: string = '';

  @HostBinding('class')
  get hostClasses(): string {
    return `cb-card${this.cardClass ? ' ' + this.cardClass : ''}`;
  }

  /** ARIA role passthrough if you want it to behave as a group/article/region */
  @Input() role: 'article' | 'group' | 'region' | undefined;
  @HostBinding('attr.role') get ariaRole() { return this.role ?? null; }
}
