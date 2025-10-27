import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'cb-prop',
  standalone: true,
  imports: [
    MatIcon,
    NgTemplateOutlet
  ],
  templateUrl: './cb-prop.component.html',
  styleUrl: './cb-prop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CbPropComponent {
  @Input() propClass: string = '';
  @Input() icon: string | boolean = '';
  @Input() thumb: TemplateRef<unknown> | boolean;
  @Input() label: TemplateRef<unknown> | boolean;
  @Input() value: TemplateRef<unknown> | boolean;

  @HostBinding('class')
  get hostClasses(): string {
    return `cb-prop${this.propClass ? ' ' + this.propClass : ''}`;
  }

  @Input() role: 'article' | 'group' | 'region' | undefined;

  @HostBinding('attr.role') get ariaRole() {
    return this.role ?? null;
  }
}
