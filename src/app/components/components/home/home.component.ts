import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientRoutes } from '../../common/client-routes';
import { isObservable, Observable, of } from 'rxjs';
import {
  AnalyticsService,
  GlobalSeoService,
  SessionService,
  SortBy,
  SortDirection,
  TrialsApiService,
  UnitOfLength
} from '@careboxhealth/core';
import {
  FeaturesConfigurationService,
  HomePageFeatureConfig,
  ShowForRegionsDirective,
  ToggleFeature
} from '@careboxhealth/layout1-shared';
import { EntryCollection } from 'contentful';
import {
  ICardArrangementWidgetFields,
  IHomeResearchAreaContent,
  IHomeResearchAreasFields,
  IImageAssetFields,
  ITabsWidget
} from '../contentful/models/contentful';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { map, shareReplay, startWith, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabsWidgetComponent } from '../contentful/tab-widget/tabs-widget.component';
import { AsyncPipe, DOCUMENT, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { GtmTriggerName } from '../../enums/gtm-trigger-name';
import { MatListModule } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { HomeSearchComponent } from './home-search/home-search.component';
import { Language } from '../../enums/language';
import { FindClinicalTrialComponent } from '../find-clinical-trial/find-clinical-trial.component';
import { CmsEntryId } from 'src/app/enums/cms-entry-id';
import { MdToHtmlPipe } from '../../pipes/md-to-html.pipe';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { CardWidget2Component } from '../contentful/card-arrangement-widget/card-widget-2/card-widget-2.component';
import { OneRowNavigationComponent } from '../../shared-features/ui/one-row-navigation/one-row-navigation.component';
import { MatIcon } from '@angular/material/icon';
import { SectionWrapperModule } from '../../shared-features/ui/components/section-wrapper/section-wrapper.module';

@Component({
  selector: 'lilly-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss', '../../../assets/styles/_v3/modules/nav-tabs.scss'],
  imports: [
    ShowForRegionsDirective,
    TabsWidgetComponent,
    NgTemplateOutlet,
    AsyncPipe,
    MatButton,
    HomeSearchComponent,
    FindClinicalTrialComponent,
    MatListModule,
    MdToHtmlPipe,
    MatFormField,
    MatSelect,
    MatOption,
    CardWidget2Component,
    OneRowNavigationComponent,
    MatIcon,
    SectionWrapperModule,
  ],
  standalone: true
})
export class HomeComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  tabsWidget: ITabsWidget;
  cardArrangementWidget: ICardArrangementWidgetFields;
  researchAreaFields: IHomeResearchAreasFields & {menu?: {fields: {trialsCnt$?: Observable<number[]> }}[]};
  heroImage: WritableSignal<IImageAssetFields> = signal(null);


  @ViewChild('body1') body1: TemplateRef<any>;
  @ViewChild('footer1') footer1: TemplateRef<any>;

  protected readonly ToggleFeature = ToggleFeature;
  readonly GtmTriggerName = GtmTriggerName;
  readonly ClientRoutes = ClientRoutes;
  readonly Language = Language;
  readonly isObservable = isObservable;
  isHomePageNewDesign = false;

  _selectResource: IHomeResearchAreasFields['menu'][0] & {fields: {trialsCnt$?: Observable<number>}};

  // injections
  private readonly trialsApiService: TrialsApiService = inject(TrialsApiService);

  get selectResource(): any & {fields: {trialsCnt$: Observable<number>}} {
    return this._selectResource;
  }

  set selectResource(resource: any) {
    this._selectResource = resource;
    if (this._selectResource.fields.trialsCnt$) {
      return;
    }
    if (!this._selectResource.fields?.condition?.[0]) {
      this._selectResource.fields.trialsCnt$ = of(1);
    } else {
      this._selectResource.fields.trialsCnt$ = this.trialsApiService.getTrialsCount({
        filters: {
          // We can not use "...", because of different format "diseaseId" vs "diseaseID"(different case of last letter)
          diseaseID: this.selectResource.fields.condition[0].fields.diseaseId,
          subDiseaseID: this.selectResource.fields.condition[0].fields.subDiseaseId,
          // We should add this param to have same response as on find trials page.
          // This param affects adding "location" to field "fields". And this affects final response from backend
          geo: {
            coordinates: null,
            distance: Number.MAX_SAFE_INTEGER,
            geoLocation: null,
            unitOfLength: UnitOfLength.MI
          }
        },
        isMatched: false,
        sort: {
          orderBy: SortBy.CTGOV_LAST_POSTED,
          direction: SortDirection.DOWN
        },
        from: 0,
        pageSize: 1000
      }, true).pipe(
        map(res => res.total),
        startWith(0),
        shareReplay(),
      );
    }

  }

  constructor(
      @Inject(DOCUMENT) private document: Document,
      protected router: Router,
      public elementRef: ElementRef,
      private contentfulService: ExtendedContentfulService,
      protected analytics: AnalyticsService,
      private viewportScroller: ViewportScroller,
      private route: ActivatedRoute,
      private seo: GlobalSeoService,
      private sessionService: SessionService,
      private featuresConfigurationService: FeaturesConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.isHomePageNewDesign =
        this.featuresConfigurationService.isFeatureEnabled(ToggleFeature.HOME_PAGE, HomePageFeatureConfig.DESIGN_V1);
    this.contentfulService
      .getEntries({content_type: 'homeResearchAreas', 'fields.key': 'research-area'})
      .pipe(take(1))
      .subscribe((res: EntryCollection<IHomeResearchAreasFields>) => {
        this.researchAreaFields = res?.items?.length ? res.items[0]?.fields : null;
        // select first item
        this.selectResource = this.researchAreaFields?.menu?.length ? this.researchAreaFields?.menu[0] : null;
      });
    this.seo.setMultiRegionData(environment.locales);
  }

  ngAfterViewInit(): void {
    this.isHomePageNewDesign ? this.loadCards() : this.loadTabs();
  }

  triggerScroll(): void {
    setTimeout(() => {
      const sectionId = this.route.snapshot.fragment;
      if (!sectionId) {
        return;
      }
      const headerHeight = 97;

      this.viewportScroller.scrollToPosition([
        0,
        this.document.getElementById(sectionId)?.offsetTop - headerHeight
      ]);
    }, 400);
  }

  onRALabelClick(value: IHomeResearchAreaContent): void {
    this.selectResource = value;
    const selectedAreaLabel: string = this.selectResource?.fields?.title;
    const selectedHLDisease: string = this.selectResource?.fields?.condition?.length ? this.selectResource?.fields?.condition[0]?.fields?.diseaseId : null;

    const entries: any = {
      action: 'HomepageRASelected',
      researchArea: selectedAreaLabel,
      diseaseId: selectedHLDisease
    };
    this.analytics.write(entries);
  }

  navigateToListingWithCriteria(item: IHomeResearchAreaContent): void {
    const entries: any = {
      action: 'ViewRATrials',
      researchArea: item?.fields?.title,
      cmsId: item?.sys.id,
      diseaseId: item?.fields?.condition?.length ? item?.fields?.condition[0]?.fields?.diseaseId : null
    };
    this.analytics.write(entries);
    this.sessionService.saveListingFilters({filters: {}, eligibilityFilters: []}, false);
    void this.router.navigateByUrl(item?.fields?.buttonLink);
  }

  loadTabs(): void {
    if (this.tabsWidget) {
      this.triggerScroll();
      return;
    }

    this.contentfulService.getEntry(CmsEntryId.TabsWidgetId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tabsWidget: ITabsWidget) => {
        this.tabsWidget = tabsWidget;
        this.triggerScroll();
        this.contentfulService.setSeoImage(this.tabsWidget?.fields?.tabs[0]?.fields?.image);
      });
  }

  loadCards(): void {
    if (this.cardArrangementWidget) {
      this.triggerScroll();
      return;
    }

    this.contentfulService.getEntries({
      content_type: 'cardArrangementWidget',
      'fields.key': 'home-page-cards'
    })
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef))
      .subscribe((cardArrangementWidget: EntryCollection<ICardArrangementWidgetFields>) => {
        this.cardArrangementWidget = cardArrangementWidget.items[0]?.fields;
        this.triggerScroll();
      });

    this.contentfulService.getEntries({
      content_type: 'imageAsset',
      'fields.key': 'hero-image-home'
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((image: EntryCollection<IImageAssetFields>) => {
        this.heroImage.set(image?.items[0]?.fields);
        this.seo.setImage(image?.items[0]?.fields?.image?.fields?.file?.url);
      });
  }
}
