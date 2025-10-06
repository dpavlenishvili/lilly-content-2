import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientRoutes } from '../../common/client-routes';
import { ConfigurationProvider } from '@careboxhealth/core';
import { NavigationListsDataService } from '../../services/navigation-lists-data.service';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { Subject } from 'rxjs';
import { IPageFields } from '../contentful/models/contentful';
import { EntryCollection } from 'contentful';
import { HeaderMenuItem, HeaderMenuItemSingle } from '../../interfaces/header-menu-item';
import { Language } from '../../enums/language';
import { LillyBaseSectionComponent } from '../../shared-features/ui/lilly-base-section/lilly-base-section.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ShowForRegionsDirective } from '@careboxhealth/layout1-shared';
import { BrowseCategoryService } from '../../shared-features/ui/browse-category.service';
import { HelperService } from '../../services/helper.service';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { SectionWrapperComponent } from '../../shared-features/ui/components/section-wrapper/section-wrapper.component';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LogoSubjectComponent } from '../../shared-features/ui/logo-subject/logo-subject.component';

@Component({
  selector: 'lilly-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss'],
  imports: [
    LillyBaseSectionComponent,
    RouterLink,
    AsyncPipe,
    ShowForRegionsDirective,
    HeroSectionComponent,
    SectionWrapperComponent,
    MatButton,
    MatIconModule,
    LogoSubjectComponent
  ],
  standalone: true
})
export class SitemapComponent implements OnInit, OnDestroy {
  sitemapReferrer = 'Sitemap';
  destroy$ = new Subject();
  headerMenu: HeaderMenuItem[] = [];

  readonly Language = Language;

  constructor(
    public configuration: ConfigurationProvider,
    public navigationListsDataService: NavigationListsDataService,
    private contentfulService: ExtendedContentfulService,
    public browseCategory: BrowseCategoryService,
    public helperService: HelperService,
  ) {}

  get clientRoutes(): typeof ClientRoutes {
    return ClientRoutes;
  }

  ngOnInit(): void {
    this.navigationListsDataService.headerMenu$
      .pipe(
        filter(menu => !!menu.length),
        switchMap(menu =>
          this.contentfulService.getEntries({
            content_type: 'page',
            'fields.pageLink.sys.id[in]': menu
              .filter(menuItem => (menuItem as HeaderMenuItemSingle).item)
              .map(menuItem => (menuItem as HeaderMenuItemSingle).item.cmsId)
              .join(',')})
            .pipe(map(pages => [menu, pages]))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([menu, pages]: [HeaderMenuItem[], EntryCollection<IPageFields>]) => {
        if (!pages.total) {
          this.headerMenu = menu;
          return;
        }

        this.headerMenu = menu.map(menuItem => {
          if ((menuItem as HeaderMenuItemSingle).item) {
            return {
              ...menuItem,
              page: pages.items.find(page => page.fields.pageLink.sys.id === (menuItem as HeaderMenuItemSingle).item.cmsId)?.fields
            };
          }

          return menuItem;
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
