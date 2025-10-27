import { Component, HostBinding, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AppIconRegistry } from '../../services/app-icon-registry.service';
import { RouterLink } from '@angular/router';
import { RouterLinkWithAccessDirective } from '../../directives/router-link-with-access.directive';

@Component({
  selector: 'lilly-content-logo-subject',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkWithAccessDirective
  ],
  templateUrl: './logo-subject.component.html',
  styleUrl: './logo-subject.component.scss'
})
export class LogoSubjectComponent {
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
