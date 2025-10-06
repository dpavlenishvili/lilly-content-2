import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ExtendedContentfulService } from '../../../../services/contentful.service';
import {
  IArticle,
  IArticleFields,
  IBlogSettingsFields,
  ISection
} from '../../../contentful/models/contentful';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Asset, EntryCollection } from 'contentful';
import { Subject } from 'rxjs';
import { ClientRoutes } from '../../../../common/client-routes';
import { HelperService } from 'src/app/services/helper.service';
import { AnalyticsService, GlobalSeoService } from '@careboxhealth/core';
import { BlogPageId, BlogService } from '../../blog.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { PageType } from '../../enums/page-type.enum';
import cloneDeep from 'lodash.clonedeep';
import { PageNavigationCreatorService } from '../../../../services/page-navigation-creator.service';
import { Positions } from '../../../../enums/positions';
import { PageSectionsStateService } from '../../../../services/page-sections-state.service';
import { DatePipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  ShareButtonContainerComponent
} from '../../components/share-button-container/share-button-container.component';
import { MatDivider } from '@angular/material/divider';
import { AuthorComponent } from '../../components/author/author.component';
import { NavElementsTabsComponent } from '../../../contentful/nav-elements-tabs/nav-elements-tabs.component';
import {
  NavElementsSidemenuComponent
} from '../../../contentful/nav-elements-sidemenu/nav-elements-sidemenu.component';
import { SectionComponent } from '../../../contentful/section/section.component';
import { BlogArticleCardComponent } from '../../components/blog-article-card/blog-article-card.component';
import { ExtendedError404Component } from '../../../error404/error404.component';
import { BlogArticleSkeletonLoaderComponent } from 'src/app/shared-features/ui/loaders/blog-article-skeleton-loader/blog-article-skeleton-loader.component';
import { ScrollSpyElDirective } from '../../../../shared-features/ui/directives/scroll-spy-el/scroll-spy-el.directive';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';
import {SectionWrapperModule} from '../../../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import {CbTagComponent} from '../../../../shared-features/ui/components/cb-tag/cb-tag.component';
import {BreadcrumbsComponent} from '../../../../shared-features/ui/breadcrumbs/breadcrumbs.component';
import { BreadcrumbLink } from '../../../../interfaces/breadcrumb-link';
import {
  CarouselCustomNavComponent
} from '../../../contentful/card-arrangement-widget/carousel-custom-nav/carousel-custom-nav.component';
import {
  CardWidget2Component
} from '../../../contentful/card-arrangement-widget/card-widget-2/card-widget-2.component';
import {
  CustomCarouselComponent
} from '../../../contentful/card-arrangement-widget/custom-carousel/custom-carousel.component';

@Component({
  selector: 'lilly-blog-article',
  templateUrl: './blog-article.component.html',
  styleUrls: ['./blog-article.component.scss'],
  providers: [PageSectionsStateService],
  imports: [
    NgClass,
    MatIcon,
    MatTooltip,
    ShareButtonContainerComponent,
    MatDivider,
    AuthorComponent,
    DatePipe,
    NavElementsTabsComponent,
    NgTemplateOutlet,
    NavElementsSidemenuComponent,
    SectionComponent,
    CarouselModule,
    BlogArticleCardComponent,
    NgIf,
    ExtendedError404Component,
    BlogArticleSkeletonLoaderComponent,
    ScrollSpyElDirective,
    MdToHtmlPipe,
    SectionWrapperModule,
    CbTagComponent,
    BreadcrumbsComponent,
    MdToHtmlPipe,
    BreadcrumbsComponent,
    CarouselCustomNavComponent,
    CardWidget2Component,
    CustomCarouselComponent
  ],
  standalone: true
})
export class BlogArticleComponent implements OnInit, OnDestroy {
  recentArticles: IArticle[] = [];
  article: IArticle;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  destroy$ = new Subject();
  shareUrl: string = window.location.href;
  readonly Positions = Positions;
  readonly PageType = PageType;
  readonly ClientRoutes = ClientRoutes;

  @ViewChild('blogArticlesArchivedPostsTooltip', {static: true}) blogArticlesArchivedPostsTooltip: ElementRef;
  blogArticlesArchivedPostsTooltipLabel: string;
  loading = true;
  articleAnalytics: {
    actionsArr?: string[];
    article?: string;
    articleID?: string;
  } = {};

  customOptions: OwlOptions = {
    nav: false,
    slideBy: 1,
    navSpeed: 500,
    dots: false,
    margin: 24,
    mouseDrag: false,
    stagePadding: 48,
    navText: ['', ''],
    responsive: {
      0: {
        items: 2
      },
      576: {
        items: 2
      },
      992: {
        items: 3
      },
      1400: {
        items: 3
      },
      1900: {
        items: 4
      },
    }
  };
  sectionsList: ISection[];
  navbarTabs: {
    sectionId: string;
    title: string;
  }[] = [];
  navbarTabSectionIds: string[] = [];
  positionNavElements: string;
  activeTab = '';
  jumpMenu = false;

  protected readonly breadcrumbLinks: BreadcrumbLink[] = [
    {
      name: $localize`:@@breadcrumb.home:Lilly Trials`,
      url: ClientRoutes.Home
    },
    {
      name: $localize`:@@breadcrumb.blogs:Blogs`,
      url: ClientRoutes.Blog
    },
    {
      name: $localize`:@@breadcrumb.story:Story`,
      url: null
    }
  ];

  constructor(
    private contentfulService: ExtendedContentfulService,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    public helperService: HelperService,
    private analytics: AnalyticsService,
    public elementRef: ElementRef,
    private pageNavigationCreatorService: PageNavigationCreatorService,
    private sectionsService: PageSectionsStateService,
    private seo: GlobalSeoService
  ) { }

  ngOnInit(): void {
    this.blogArticlesArchivedPostsTooltipLabel = this.blogArticlesArchivedPostsTooltip.nativeElement.innerHTML;
    this.watchRouteParams();
  }

  private watchRouteParams(): void {
    this.route.params
      .pipe(
        switchMap(params => {
          this.loading = true;

          return this.contentfulService.getArticles({
            'fields.slug': params['article-slug']
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: EntryCollection<IArticleFields>) => {
        this.article = res?.items[0] as IArticle;

        if (!this.article?.fields) {
          void this.router.navigate([ClientRoutes.Blog]);
          return;
        }
        this.seo.setMultiRegionData(this.article.fields.languages);
        this.sectionsService.initState(this.article.fields.sections);

        this.setMetadata(this.article.fields.title, this.article.fields.heroImage);
        this.updateRecentArticles();
        this.articleAnalytics = {
          actionsArr: ['BlogArticleLinkClick', 'BlogArticleLinkAccepted'],
          article: this.article?.fields?.title,
          articleID: this.article?.fields?.slug,
        };
        this.loading = false;

        this.analytics.write({
          action: 'ViewedBlogArticle',
          articleID: this.article?.fields?.slug,
          article: this.article?.fields?.title,
          entryId: this.article?.sys?.id
        });

        this.sectionsList =  this.article?.fields?.sections;
        this.prepareNavOrientation();
      });
  }

  prepareNavOrientation() {
    const prepareNavigationResult = this.pageNavigationCreatorService.prepareNavOrientation(this.article?.fields);
    this.navbarTabs = prepareNavigationResult.navbarTabs;
    this.navbarTabSectionIds = prepareNavigationResult.navbarTabSectionIds;
    this.jumpMenu = prepareNavigationResult.jumpMenu;
    this.activeTab = prepareNavigationResult.activeTab;
    this.positionNavElements = prepareNavigationResult.positionNavElements;
  }

  updateRecentArticles() {
    this.contentfulService
      .getArticles({ order: '-fields.publishDate', limit: 1000 })
      .pipe(take(1))
      .subscribe((recentArticles: EntryCollection<IArticleFields>) => {
        this.recentArticles = recentArticles?.items
          .sort((a, b) => Number(b?.fields?.pinned) - Number(a?.fields?.pinned))
          .filter(article => article.sys.id !== this.article.sys.id)
          .slice(0, 5) as IArticle[];
        this.cdr.detectChanges();
      });
  }
  setMetadata(articleTitle: string, heroImage: Asset): void {
    this.blogService.blogSettings$
      .pipe(
        filter(blogSettings => !!blogSettings),
        tap((blogSettings: IBlogSettingsFields) => {
          const copiedPageMetaAndShare = cloneDeep(blogSettings?.pageMetaAndShare);
          const metadata = copiedPageMetaAndShare?.find(m => m.fields.pageId === BlogPageId.ARTICLE);

          if (metadata) {
            metadata.fields.metaTitle = `${articleTitle} | ${metadata.fields.metaTitle}`;
          }
          this.blogService.applyBlogPageMetadata(copiedPageMetaAndShare, BlogPageId.ARTICLE, heroImage);
        }),
        takeUntil(this.destroy$))
      .subscribe();
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
