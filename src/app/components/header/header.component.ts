import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ClientRoutes } from '../../common/client-routes';
import { LanguageObj, LanguageService } from '../../services/language.service';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { MatIcon } from '@angular/material/icon';
import { HeaderHeightDirective } from '../../directives/header-height.directive';
import { LogoSubjectComponent } from '../logo-subject/logo-subject.component';
import { OverlayTriggerDirective } from '../../directives/overlay-trigger.directive';
import { AppIconRegistry } from '../../services/app-icon-registry.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { RouterLinkWithAccessDirective } from '../../directives/router-link-with-access.directive';


@Component({
  selector: 'lilly-content-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterLinkWithAccessDirective,
    NgTemplateOutlet,
    NgClass,
    LanguageSwitcherComponent,
    MatIconButton,
    MatButtonModule,
    MatIcon,
    LogoSubjectComponent,
    HeaderHeightDirective,
    OverlayTriggerDirective,
    LogoSubjectComponent,
    LanguageSwitcherComponent,
    OverlayTriggerDirective,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LillyHeaderComponent implements OnInit {
  menuMobileTrigger = viewChild<OverlayTriggerDirective>('menuMobileTrigger');
  menuTrigger = viewChild<OverlayTriggerDirective>('menuTrigger');
  isHeaderMenuCollapsed = signal(true);
  isFloatMenuOpen = signal(false);
  isFloatMobileMenuOpen = signal(false);
  ClientRoutes = ClientRoutes;

  //desk
  startMenuId: string = 'menu-' + 5000;
  startTabId: string = 'tab-' + 5000;
  activeTabId = signal<string>(this.startTabId);
  //mobile
  isSubMenuMobile = signal(false);
  langMobileNumId = 5000;
  activeMobileTabId = signal<string>('');

  // injections
  public readonly languageService: LanguageService = inject(LanguageService);
  protected readonly router: Router = inject(Router);
  private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);
  private readonly destroyRef = inject(DestroyRef);


  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e): e is NavigationStart => e instanceof NavigationStart)
      )
      .subscribe(() => {
        this.isHeaderMenuCollapsed.set(true);
        if (this.isFloatMobileMenuOpen()) {
          this.toggleMenuMobile();
        }
        if (this.isFloatMenuOpen()) {
          this.toggleMenu();
        }
      });
  }

  registerIcons(): void {
    this.iconRegistry.addSvgIcon('menu', '/assets/svg/lilly/menu.svg');
    this.iconRegistry.addSvgIcon('network', '/assets/svg/lilly/network.svg');
    this.iconRegistry.addSvgIcon('close', '/assets/svg/lilly/close.svg');
    this.iconRegistry.addSvgIcon('arrow_back', '/assets/svg/arrow_back.svg');
    this.iconRegistry.addSvgIcon('search', '/assets/svg/lilly/search.svg');
  }

  toggleMenuMobile(): void {
    if (this.isSubMenuMobile()) {
      this.toggleSubMenuMobile();
    }
    this.menuMobileTrigger()?.toggle();
  }

  toggleMenu(): void {
    this.menuTrigger()?.toggle();
  }

  toggleHeaderMenu(): void {
    this.isHeaderMenuCollapsed.update(value => !value);
  }

  setLanguage(language: LanguageObj): void {
    this.languageService.setLanguageWithConfirm(language);
  }

  // Desktop tabs

  onMenuHover(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (target && target.id.startsWith('menu-')) {
      const suffix = target.id.replace('menu-', '');
      this.activeTabId.set(`tab-${suffix}`);
    }
  }
  isActive(tabId: string): boolean {
    return this.activeTabId() === tabId;
  }

  onMenuMobile(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (target && target.id.startsWith('menuMobile-')) {
      const suffix = target.id.replace('menuMobile-', '');
      this.activeMobileTabId.set(`tabMobile-${suffix}`);
      this.isSubMenuMobile.set(true);
    }
  }
  toggleSubMenuMobile(): void {
    this.activeMobileTabId.set('');
    this.isSubMenuMobile.update(value => !value);
  }

  isMobileActive(tabId: string): boolean {
    return this.activeMobileTabId() === tabId;
  }
}
