import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AnalyticsService } from '@careboxhealth/core';
import { ClientRoutes } from '../../common/client-routes';
import { LanguageObj, LanguageService } from '../../shared-features/ui/language.service';
import { NavigationListsDataService } from '../../services/navigation-lists-data.service';
import { Language } from '../../enums/language';
import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { DeepGtmTriggerDirective, HideForRegionsDirective } from '@careboxhealth/layout1-shared';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { MatIcon } from '@angular/material/icon';
import { HeaderMenuItemSingle } from '../../interfaces/header-menu-item';
import { CmsEntryId } from '../../enums/cms-entry-id';
import { MatAccordion } from '@angular/material/expansion';
import { LogoSubjectComponent } from '../../shared-features/ui/logo-subject/logo-subject.component';
import { HeaderHeightDirective } from '../../shared-features/ui/directives/header-height.directive';
import { OverlayTriggerDirective } from '../../shared-features/ui/directives/overlay-trigger.directive';
import { Subscription } from 'rxjs';
import { BrowseCategoryService } from '../../shared-features/ui/browse-category.service';
import { CbCardModule } from '../../shared-features/ui/components/cb-card/src/app/shared/card';
import { MatDivider } from '@angular/material/divider';
import { HelperService } from '../../services/helper.service';
import { MenuImageList } from './menu-image';


@Component({
  selector: 'lilly-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    HideForRegionsDirective,
    NgClass,
    LanguageSwitcherComponent,
    AsyncPipe,
    MatIconButton,
    MatButtonModule,
    MatIcon,
    DeepGtmTriggerDirective,
    LogoSubjectComponent,
    HeaderHeightDirective,
    OverlayTriggerDirective,
    CbCardModule,
    MatAccordion,
    MatDivider
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          position: 'relative',
          top: 0,
          transform: 'translateY(0)'
        }),
        animate('250ms ease-in', style({
          opacity: 1,
          position: 'relative',
          top: 0,
          transform: 'translateY(0)'
        }))
      ])
    ])
  ]
})
export class LillyHeaderComponent implements OnInit {
    @ViewChild('menuMobileTrigger', {static: false}) menuMobileTrigger?: OverlayTriggerDirective;
    @ViewChild('menuTrigger', {static: false}) menuTrigger?: OverlayTriggerDirective;
    isHeaderMenuCollapsed = true;
    isFloatMenuOpen = false;
    isFloatMobileMenuOpen = false;
    headerReferrer = 'Header';
    ClientRoutes = ClientRoutes;
    readonly Language: typeof Language = Language;
    protected readonly MenuImageList = MenuImageList;

    //desk
    startMenuId: string = 'menu-' + 5000;
    startTabId: string = 'tab-' + 5000;
    activeTabId: string = this.startTabId;
    //mobile
    isSubMenuMobile = false;
    langMobileNumId = 5000;
    activeMobileTabId: string = '';
    private sub = new Subscription();
    headerMenuLength?: number;

    constructor(
        protected router: Router,
        public languageService: LanguageService,
        public navigationListsDataService: NavigationListsDataService,
        private analytics: AnalyticsService,
        public browseCategory: BrowseCategoryService,
        public helperService: HelperService,
    ) {
    }

    ngOnInit(): void {
      this.navigationListsDataService.loadHeaderMenu();
      this.sub.add(
        this.navigationListsDataService.headerMenuLength$.subscribe(len => {
          this.headerMenuLength = len;
        })
      );

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
      this.languageService.setLanguageWithConfirm(language, this.router.url);
    }

    // In this method we are sending two analytic actions.
    // The first one we want to manage, and the second one Contentful's editors
    sendAnalyticsMenuItemSingle(menuItem: HeaderMenuItemSingle): void {
      const {item} = menuItem;
      this.navigationListsDataService.sendAnalyticsMenuItemSingle(item.label, item.cmsId);

      if (!item.analytics) {
        return;
      }

      this.analytics.write({...item.analytics});
    }

    sendAnalyticsMenuItemBlog(): void {
      this.navigationListsDataService.sendAnalyticsMenuItemSingle('Blog', CmsEntryId.BlogSettings);
    }

    checkLongStringLanguage(languageKey: string, languages: Language[]): boolean {
    // Convert incoming key to lowercase and compare against Language enum values
      return languages.includes(languageKey.toLowerCase() as Language);
    }

    // Desktop tabs

    onMenuHover(event: MouseEvent): void {
      const target = event.currentTarget as HTMLElement | null;
      if (target && target.id.startsWith('menu-')) {
        // Extract numeric/id suffix
        const suffix = target.id.replace('menu-', '');
        this.activeTabId = `tab-${suffix}`;
        // console.log(this.activeTabId);
      }
    }
    isActive(tabId: string): boolean {
      return this.activeTabId === tabId;
    }

    onMenuMobile(event: MouseEvent): void {
      const target = event.currentTarget as HTMLElement | null;
      if (target && target.id.startsWith('menuMobile-')) {
        // Extract numeric/id suffix
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
