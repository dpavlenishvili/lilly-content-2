import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  makeStateKey,
  TransferState,
  inject
} from '@angular/core';
import { IPageFields, IPageLink } from '../models/contentful';
import { ExtendedContentfulService } from '../../../services/contentful.service';
import { Location, NgTemplateOutlet, NgClass } from '@angular/common';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { finalize, share, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { ClientRoutes } from '../../../common/client-routes';
import {
  AnalyticsService,
  GlobalSeoService,
  NavigationBackService, SortBy, SortDirection,
  TrialsApiService,
  TrialStatusId,
  TrialsDTO, TrialService
} from '@careboxhealth/core';
import { Modifier, SearchCriteria } from '../models/search-criteria';
import { HelperService } from 'src/app/services/helper.service';
import { PageType } from '../../blog/enums/page-type.enum';

import { ScrollToTopService } from '../../../services/scroll-to-top.service';
import { MediaContentType } from '../media-content/media-content-type.enum';
import { Positions } from '../../../enums/positions';
import { PageNavigationCreatorService } from '../../../services/page-navigation-creator.service';
import { PageSectionsStateService } from '../../../services/page-sections-state.service';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { PageMediaComponent } from '../page-media/page-media.component';
import { NavElementsTabsComponent } from '../nav-elements-tabs/nav-elements-tabs.component';
import { NavElementsSidemenuComponent } from '../nav-elements-sidemenu/nav-elements-sidemenu.component';
import { SectionComponent } from '../section/section.component';
import { ArticlePageSkeletonLoaderComponent } from 'src/app/shared-features/ui/loaders/article-page-skeleton-loader/article-page-skeleton-loader.component';
import { ScrollSpyElDirective } from '../../../shared-features/ui/directives/scroll-spy-el/scroll-spy-el.directive';

interface IPageData {
  pageLinkId: string;
  pageFields: IPageFields;
  filters: SearchCriteria;
  trials: any;
}

const STATE_KEY_PAGE_DATA = makeStateKey<IPageData>('page-data');


@Component({
  selector: 'lilly-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [PageSectionsStateService],
  imports: [
    HeroSectionComponent,
    PageMediaComponent,
    NavElementsTabsComponent,
    NgTemplateOutlet,
    NavElementsSidemenuComponent,
    NgClass,
    SectionComponent,
    ArticlePageSkeletonLoaderComponent,
    ScrollSpyElDirective
  ],
  standalone: true
})
export class PageComponent implements OnInit, OnDestroy {
  pageFields: IPageFields;
  filters: SearchCriteria;
  subsiteName: string;
  trials;
  loading = true;
  destroy$ = new Subject();
  readonly PageType = PageType;
  readonly Positions = Positions;

  navbarTabs: any = [];
  navbarTabSectionIds: string[] = [];
  positionNavElements: string;
  activeTab = '';
  jumpMenu = false;

  @HostBinding('style.--page-color') pageColor: string;
  @HostBinding('style.--page-color-over') pageColorOver: string;
  @HostBinding('class.has-page-background') hasPageBackground = false;

  // injections
  private readonly trialsApiService: TrialsApiService = inject(TrialsApiService);
  private readonly trialService: TrialService = inject(TrialService);

  constructor(
    private contentfulService: ExtendedContentfulService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private analytics: AnalyticsService,
    private navigationBackService: NavigationBackService,
    protected transferState: TransferState,
    @Inject(PLATFORM_ID) protected platformId,
    public helperService: HelperService,
    private scrollToTopService: ScrollToTopService,
    private pageNavigationCreatorService: PageNavigationCreatorService,
    protected sectionsService: PageSectionsStateService,
    private seo: GlobalSeoService
  ) {}

  ngOnInit() {
    this.watchDataChanges();
  }

  watchDataChanges(): void {
    combineLatest([
      this.contentfulService.pageLinks$,
      this.route.url
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([links, UrlSegments]: [IPageLink[], UrlSegment[]]) => {
        if (!links) {
          return;
        }

        this.resetData();

        const pagePath = `/${UrlSegments.map(segment => segment.path).join('/')}`;
        const pageLink = this.getPageLink(links, pagePath);

        if (!pageLink) {
          void this.router.navigate([ClientRoutes.Home]);
          return;
        }

        if (pageLink && pageLink?.fields?.url !== pagePath) {
          void this.router.navigateByUrl(pageLink?.fields?.url);
          return;
        }

        this.loadPageData(pageLink.sys.id);
      });
  }

  getPageLink(links, pagePath): IPageLink {
    const pageLink = links.find(link => link?.fields?.url === pagePath);

    if (!pageLink) {
      const reducedPagePath = pagePath.split('/').slice(0, -1).join('/');

      if (!reducedPagePath) {
        return;
      }

      return this.getPageLink(links, reducedPagePath);
    }

    return pageLink;
  }

  resetData() {
    this.pageFields = null;
    this.filters = null;
    this.trials = null;
    this.cdr.detectChanges();
  }

  private fetchData(pageLinkId: string): Observable<any> {
    this.loading = true;

    return this.contentfulService
      .getPage(pageLinkId)
      .pipe(
        switchMap(page => {
          if (!page) {
            void this.router.navigate([ClientRoutes.NotFound]);
            return;
          }

          this.pageFields = page?.fields;
          this.filters = this.convertCmsDataToFilters(page?.fields);
          this.subsiteName = page?.fields?.metadata?.fields?.metaTitle;
          this.sectionsService.initState(page?.fields?.sections);
          if (!this.isPageIncludeTrialsWidget(page?.fields) || (!page?.fields?.trialConditions?.length && !page?.fields?.modifiers?.length)) {
            return of({ trials: [] });
          }

          return this.trialsApiService.getTrialsV3({
            filters: {
              ...this.filters,
              status: [TrialStatusId.Open]
            },
            additionalSorting: [`${SortBy.HAS_DISEASE_SITE}:${SortDirection.DOWN}`],
            pageSize: 100,
            sort: {
              orderBy: SortBy.CTGOV_LAST_POSTED,
              direction: SortDirection.DOWN
            },
            from: 0,
            isMatched: false
          });
        }),
        tap((res: TrialsDTO) => {
          this.trials = res?.trials?.map(trial => this.trialService.convertFromDTO(trial, [])) || [];
          this.loading = false;
        }),
        take(1),
        share()
      );
  }

  prepareNavOrientation() {
    const prepareNavigationResult = this.pageNavigationCreatorService.prepareNavOrientation(this.pageFields);
    this.navbarTabs = prepareNavigationResult.navbarTabs;
    this.navbarTabSectionIds = prepareNavigationResult.navbarTabSectionIds;
    this.jumpMenu = prepareNavigationResult.jumpMenu;
    this.activeTab = prepareNavigationResult.activeTab;
    this.positionNavElements = prepareNavigationResult.positionNavElements;
  }

  loadPageData(pageLinkId: string): void {
    const state = this.transferState.get(STATE_KEY_PAGE_DATA, undefined);
    let fetch: Observable<any>;
    if (state && state.pageLinkId === pageLinkId) {
      this.trials = state.trials;
      this.filters = state.filters;
      this.pageFields = state.pageFields;
      this.sectionsService.initState(state.pageFields?.sections);
      fetch = of('');
    } else {
      fetch = of('').pipe(
        tap(() => this.loading = true),
        switchMap(() => this.fetchData(pageLinkId)),
        finalize(() => this.loading = false),
      );
    }

    fetch.subscribe(() => {
      this.cdr.markForCheck();
      this.triggerScroll();
      this.prepareNavOrientation();
      if (this.pageFields) {
        const { primaryColor, backToTopText, backToTop } = this.pageFields;
        this.pageColor = primaryColor;
        this.pageColorOver = HelperService.lightenDarkenColor(primaryColor, -21);
        this.hasPageBackground = Boolean(this.pageFields?.showBackground);

        HelperService.setPageColor(primaryColor);
        this.scrollToTopService.setData({
          text: backToTopText,
          show: backToTop
        });
      }
      const heroImage = this.pageFields?.displayMedia === MediaContentType.IMAGE ? this.pageFields?.image : null;
      this.contentfulService.applyPageMetadata(this.pageFields.metadata, heroImage);
      this.seo.setMultiRegionData(this.pageFields.pageLink.fields.languages);

      if (this.pageFields?.pageLink?.fields?.key !== 'clinical-trial-information') {
        this.analytics.write({
          action: 'ViewedSubsite',
          title: this.pageFields.metadata?.fields?.metaTitle,
          referrer: this.getReferrer()
        });
      }
    });
  }

  triggerScroll(): void {
    setTimeout(() => {
      const sectionId = this.route.snapshot.fragment;
      this.helperService.scrollToSection(sectionId);
    }, 400);
  }

  getReferrer(): string {
    if (this.location.getState() && this.location.getState()['referrer']) {
      return this.location.getState()['referrer'];
    }

    if (this.navigationBackService.previousPath() === '/') {
      return 'HomePage';
    }

    return this.navigationBackService.previousPath();
  }

  convertCmsDataToFilters(pageFields: IPageFields): SearchCriteria {
    const diseaseIds: string[] = [];
    const subDiseaseIds: string[] = [];
    const modifiers: Modifier[] = [];

    pageFields.trialConditions?.forEach(tC => {
      if (tC.fields.diseaseId) {
        diseaseIds.push(tC?.fields?.diseaseId);
      }

      if (tC.fields.subDiseaseId) {
        subDiseaseIds.push(tC?.fields?.subDiseaseId);
      }
    });

    pageFields.modifiers?.forEach(m => {
      modifiers.push({
        partnerCode: m?.fields?.partnerCode || null,
        modifierId: m?.fields?.id,
        modifier: m?.fields?.name,
        diseaseId: m?.fields?.diseaseId || null,
        subDiseaseId: m?.fields?.subDiseaseId || null
      });
    });

    return {
      diseaseID: diseaseIds?.length ? [...new Set(diseaseIds)] : null,
      subDiseaseID: subDiseaseIds?.length ? [...new Set(subDiseaseIds)] : null,
      modifiers: modifiers?.length ? modifiers : null
    };
  }

  isPageIncludeTrialsWidget(pageFields: IPageFields): boolean {
    return pageFields?.sections?.some(s => {
      return s?.fields?.widgets?.some(w => w?.sys?.contentType?.sys.id === 'trials-widget');
    });
  }

  onSectionChange(sectionId: string) {
    this.activeTab = sectionId;
    this.helperService.onSectionChangeListener(sectionId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
