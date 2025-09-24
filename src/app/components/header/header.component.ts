import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
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


@Component({
  selector: 'lilly-content-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
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
    OverlayTriggerDirective
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LillyHeaderComponent implements OnInit {
    @ViewChild('menuMobileTrigger', {static: false}) menuMobileTrigger?: OverlayTriggerDirective;
    @ViewChild('menuTrigger', {static: false}) menuTrigger?: OverlayTriggerDirective;
    isHeaderMenuCollapsed = true;
    isFloatMenuOpen = false;
    isFloatMobileMenuOpen = false;
    ClientRoutes = ClientRoutes;

    //desk
    startMenuId: string = 'menu-' + 5000;
    startTabId: string = 'tab-' + 5000;
    activeTabId: string = this.startTabId;
    //mobile
    isSubMenuMobile = false;
    langMobileNumId = 5000;
    activeMobileTabId: string = '';

    // injections
    public readonly languageService: LanguageService = inject(LanguageService);
    protected readonly router: Router = inject(Router);
    private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);


    constructor() {
      this.registerIcons();
    }

    ngOnInit(): void {
      this.router.events.subscribe(val => {
        if (val instanceof NavigationStart) {
          this.isHeaderMenuCollapsed = true;
          if (this.isFloatMobileMenuOpen) {
            this.toggleMenuMobile();
          }
          if (this.isFloatMenuOpen) {
            this.toggleMenu();
          }
        }
      });
    }

    registerIcons(): void {
      this.iconRegistry.addSvgIcon('menu', '/assets/svg/lilly/menu.svg');
      this.iconRegistry.addSvgIcon('network', '/assets/svg/lilly/network.svg');
      this.iconRegistry.addSvgIcon('close', '/assets/svg/lilly/close.svg');
      this.iconRegistry.addSvgIcon('arrow_back', '/assets/svg/arrow_back.svg');
    }

    toggleMenuMobile(): void {
      if (this.isSubMenuMobile) {
        this.toggleSubMenuMobile();
      }
      this.menuMobileTrigger?.toggle();
    }

    toggleMenu(): void {
      this.menuTrigger?.toggle();
    }

    toggleHeaderMenu(): void {
      this.isHeaderMenuCollapsed = !this.isHeaderMenuCollapsed;
    }

    setLanguage(language: LanguageObj): void {
      this.languageService.setLanguageWithConfirm(language);
    }

    // Desktop tabs

    onMenuHover(event: MouseEvent): void {
      const target = event.currentTarget as HTMLElement | null;
      if (target && target.id.startsWith('menu-')) {
        const suffix = target.id.replace('menu-', '');
        this.activeTabId = `tab-${suffix}`;
      }
    }
    isActive(tabId: string): boolean {
      return this.activeTabId === tabId;
    }

    onMenuMobile(event: MouseEvent): void {
      const target = event.currentTarget as HTMLElement | null;
      if (target && target.id.startsWith('menuMobile-')) {
        const suffix = target.id.replace('menuMobile-', '');
        this.activeMobileTabId = `tabMobile-${suffix}`;
        this.isSubMenuMobile = true;
      }
    }
    toggleSubMenuMobile(): void {
      this.activeMobileTabId = '';
      this.isSubMenuMobile = !this.isSubMenuMobile;
    }

    isMobileActive(tabId: string): boolean {
      return this.activeMobileTabId === tabId;
    }
}
