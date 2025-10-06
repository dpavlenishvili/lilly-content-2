import {
  AfterViewInit,
  Component, DestroyRef,
  ElementRef, HostListener,
  inject,
  OnDestroy,
  OnInit, signal,
  ViewChild, WritableSignal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location, LocationStrategy, NgClass, NgStyle, NgTemplateOutlet, SlicePipe } from '@angular/common';
import { combineLatest, Subject, Subscription} from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { ExtendedContentfulService } from '../../../../services/contentful.service';
import { IArticle, IArticleCategory, IBlogSettingsFields } from '../../../contentful/models/contentful';
import { ClientRoutes } from '../../../../common/client-routes';
import { BlogPageId, BlogService } from '../../blog.service';
import { AnalyticsService } from '@careboxhealth/core';
import { UiLayoutGridService } from '@careboxhealth/layout1-shared';
import { SortControl, SortingComponent } from './sorting/sorting.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListModule, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BlogArticleCardComponent } from '../../components/blog-article-card/blog-article-card.component';
import {
  BlogPageSkeletonLoaderComponent
} from 'src/app/shared-features/ui/loaders/blog-page-skeleton-loader/blog-page-skeleton-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  OneRowNavigationComponent
} from '../../../../shared-features/ui/one-row-navigation/one-row-navigation.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { SectionWrapperModule } from '../../../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import { CbTagComponent } from '../../../../shared-features/ui/components/cb-tag/cb-tag.component';

const PARAMS = {
  CATEGORY: 'category',
  ARCHIVED: 'show-archived',
  SORT: 'sort'
};

const ARCHIVED_VALUE = {
  YES: 'yes',
  NO: 'no'
};

enum SortBy {
    DATE = 'date',
    POPULARITY = 'popularity'
}

@Component({
  selector: 'lilly-blog-articles',
  templateUrl: './blog-articles.component.html',
  styleUrls: ['./blog-articles.component.scss', '../../../../../assets/styles/_v3/modules/nav-tabs.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatFormFieldModule,
    MatInput,
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFabButton,
    NgClass,
    NgStyle,
    MatSelectionList,
    MatListOption,
    MatTooltip,
    MatSlideToggle,
    NgTemplateOutlet,
    SortingComponent,
    SlicePipe,
    BlogArticleCardComponent,
    RouterLink,
    BlogPageSkeletonLoaderComponent,
    NgxSkeletonLoaderModule,
    MatCheckboxModule,
    MatListModule,
    OneRowNavigationComponent,
    MatOption,
    MatSelect,
    SectionWrapperModule,
    CbTagComponent
  ],
  standalone: true
})
export class BlogArticlesComponent implements OnInit, OnDestroy, AfterViewInit {
  public uiGridService = inject(UiLayoutGridService);
  protected locationStrategy = inject(LocationStrategy);
  protected contentfulService = inject(ExtendedContentfulService);
  protected blogService = inject(BlogService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected formBuilder = inject(UntypedFormBuilder);
  protected analytics = inject(AnalyticsService);
  protected destroyRef = inject(DestroyRef);
  protected location = inject(Location);

    @ViewChild('sortingNameDate', {static: true}) sortingNameDate: ElementRef;
    @ViewChild('sortingSlugDate', {static: true}) sortingSlugDate: ElementRef;
    @ViewChild('sortingNamePopularity', {static: true}) sortingNamePopularity: ElementRef;
    @ViewChild('sortingSlugPopularity', {static: true}) sortingSlugPopularity: ElementRef;
    @ViewChild('blogArticlesArchivedPostsTooltip', {static: true}) blogArticlesArchivedPostsTooltip: ElementRef;

    articles: IArticle[] = [];
    categories: IArticleCategory[] = [];
    sortList: SortControl[] = [];

    allTab: IArticleCategory = {
      sys: {id: 'all'},
      fields: {
        title: 'All',
        slug: 'all'
      }
    } as unknown as IArticleCategory;
    activeTab: WritableSignal<string> = signal(this.allTab.sys.id);

    pageSize: number;
    isShowAll = false;
    categoriesViewStatus = false;

    subscription: Subscription;
    destroy$ = new Subject();
    loading = false;
    blogArticlesArchivedPostsTooltipLabel: string;

    searchValue = '';
    filtersForm: UntypedFormGroup;

    ClientRoutes = ClientRoutes;

    loadersAmount = 4;
    breakPoint: number = 1;
    blogAboutLink = this.locationStrategy.prepareExternalUrl(ClientRoutes.BlogAbout);

    ngAfterViewInit(): void {
      this.pageSize = this.getPageSize();
    }

    @HostListener('window:resize')
    onResize() {
      this.pageSize = this.getPageSize();
    }


    constructor() {
      this.filtersForm = this.formBuilder.group({
        categories: [],
        isArchived: [],
        sortBy: []
      });
    }

    ngOnInit(): void {
      this.blogService.blogSettings$.pipe(
        filter(blogSettings => !!blogSettings),
        tap((blogSettings: IBlogSettingsFields) => {
          this.blogService.applyBlogPageMetadata(blogSettings?.pageMetaAndShare, BlogPageId.HOME);
        }),
        takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.setSortingList();
      this.watchFiltersChanges();
      this.getCategories();

      this.analytics.write({action: 'ViewedBlog'});
      this.blogArticlesArchivedPostsTooltipLabel = this.blogArticlesArchivedPostsTooltip.nativeElement.innerHTML;
    }


    getPageSize(): number {
      return this.uiGridService.gridSize >= this.breakPoint ? 8 : 6;
    }

    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.destroy$.next();
      this.destroy$.complete();
    }

    getArticles(formValues): void {
      this.loading = true;
      this.subscription && this.subscription.unsubscribe();

      let filters = {};
      if (formValues.categories.length) {
        filters = {
          ...filters,
          'fields.category.sys.id[in]': formValues.categories.join(',')
        };
      }

      if (!formValues.isArchived) {
        filters = {
          ...filters,
          'fields.archived': false
        };
      }

      this.subscription = this.contentfulService.getArticles({limit: 1000, ...filters})
        .subscribe(res => {
          this.articles = this.getSortingArticles(res?.items as IArticle[], formValues.sortBy?.value);
          this.isShowAll = res?.items?.length <= this.pageSize;
          this.loading = false;
        });
    }

    getCategories() {
      this.blogService
        .getBlogSettings()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((blogSettings: IBlogSettingsFields) => {
          this.categories = this.addAllTabToCategoryNavigation(blogSettings?.categoryNavigation);
          this.parseQueryParams(blogSettings?.categoryNavigation);
        });
    }

    private addAllTabToCategoryNavigation(categories: IArticleCategory[]): IArticleCategory[] {
      if (!categories?.length) {
        return;
      }

      return [this.allTab, ...categories];
    }

    parseQueryParams(allCategories: IArticleCategory[]) {
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        const categorySlugs = params[PARAMS.CATEGORY] ? params[PARAMS.CATEGORY].split(',') : [];
        const isArchived = !!(
          params[PARAMS.ARCHIVED] && params[PARAMS.ARCHIVED] === ARCHIVED_VALUE.YES
        );

        const categories = categorySlugs
          .map(slug => {
            const category = allCategories.find(c => {
              return c?.fields?.slug?.toLowerCase() === slug?.toLowerCase();
            });

            return category?.sys.id;
          })
          .filter(id => id);

        const sortItem = this.sortList.find(item => item.slug === params[PARAMS.SORT]);
        const sortBy = sortItem ? sortItem : this.sortList.find(item => item.value === SortBy.DATE);

        this.filtersForm.patchValue({
          categories,
          isArchived,
          sortBy
        });
      });
    }

    watchFiltersChanges(): void {
      let isFirstFiltersEmit = true;
      let isFirstSortEmit = true;

      this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(filters => {
          this.getArticles(filters);
          this.updateUrl(filters);
          this.blogService.updateIsShowArchivedArticles(filters.isArchived);
        });

      combineLatest([this.categoriesField.valueChanges, this.isArchivedField.valueChanges])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([categories, isArchived]) => {
          if (isFirstFiltersEmit) {
            isFirstFiltersEmit = false;

            if (!categories.length && !isArchived) {
              return;
            }
          }

          this.analytics.write({
            categoriesList: this.getCategorySlugs(categories).join(',').split(','),
            archive: isArchived,
            action: 'FilteredBlog'
          });
        });

      this.sortByField.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(sortBy => {
          if (isFirstSortEmit) {
            isFirstSortEmit = false;

            if (sortBy.value === SortBy.DATE) {
              return;
            }
          }

          this.analytics.write({
            sortBy: sortBy.slug,
            action: 'SortBlog'
          });
        });
    }

    updateUrl(formValues): void {
      const categorySlugs = this.getCategorySlugs(formValues.categories);
      const url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: {
            [PARAMS.CATEGORY]: categorySlugs.length ? categorySlugs.join(',') : undefined,
            [PARAMS.ARCHIVED]: formValues.isArchived ? ARCHIVED_VALUE.YES : ARCHIVED_VALUE.NO,
            [PARAMS.SORT]: formValues.sortBy ? formValues.sortBy?.slug : undefined
          }
        })
        .toString();

      this.location.replaceState(url);
    }

    onSearchBlogs(search: string): void {
      if (!search) {
        return;
      }

      void this.router.navigate([ClientRoutes.BlogSearch, search]);
    }

    setSortingList() {
      this.sortList = [
        {
          name: this.sortingNameDate.nativeElement.innerHTML,
          value: SortBy.DATE,
          slug: this.sortingSlugDate.nativeElement.innerHTML
        },
        {
          name: this.sortingNamePopularity.nativeElement.innerHTML,
          value: SortBy.POPULARITY,
          slug: this.sortingSlugPopularity.nativeElement.innerHTML
        }
      ];
    }

    getSortingArticles(articles: IArticle[], sortBy: SortBy): IArticle[] {
      if (!articles?.length || !sortBy) {
        return [];
      }

      switch (sortBy) {
      case SortBy.DATE:
        return articles.sort(
          (a, b) =>
            Number(b.fields.pinned) - Number(a.fields.pinned) ||
            new Date(b.fields.revisedDate || b.fields.publishDate || 0).valueOf() -
            new Date(a.fields.revisedDate || a.fields.publishDate || 0).valueOf()
        );
      case SortBy.POPULARITY:
        return articles.sort(
          (a, b) =>
            Number(b.fields.pinned) - Number(a.fields.pinned) ||
            (b.fields.popularity?.fields?.numberOfViews || 0) -
            (a.fields.popularity?.fields?.numberOfViews || 0)
        );
      default:
        return articles;
      }
    }

    getCategorySlugs(categories: string[]): string[] {
      if (!categories?.length) {
        return [];
      }

      return categories.map(id => {
        const category = this.categories.find(c => {
          return c.sys.id === id;
        });

        return category?.fields?.slug;
      });
    }

    get categoriesField() {
      return this.filtersForm.get('categories');
    }

    get isArchivedField() {
      return this.filtersForm.get('isArchived');
    }

    get sortByField() {
      return this.filtersForm.get('sortBy');
    }

    onTabSelect(id: string): void {
      if (this.activeTab() === id) return;

      this.activeTab.set(id);
      this.categoriesField?.setValue(id === 'all' ? [] : [id]);
    }
}
