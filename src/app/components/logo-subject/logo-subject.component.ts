import { Component, HostBinding, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AppIconRegistry } from '../../services/app-icon-registry.service';

@Component({
  selector: 'lilly-content-logo-subject',
  standalone: true,
  imports: [
    MatIcon,
  ],
  templateUrl: './logo-subject.component.html',
  styleUrl: './logo-subject.component.scss'
})
export class LogoSubjectComponent {
  readonly text = input<string>('Trials');
  readonly hideText = input<boolean>(false);

  @HostBinding('class')
  get hostClasses(): string {
    return 'lilly-logo-subject';
  }

  private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);

  constructor() {
    this.registerIcons();
  }


  registerIcons(): void {
    this.iconRegistry.addSvgIcon('lilly', '/assets/svg/lilly/lilly.svg');
  }
}
