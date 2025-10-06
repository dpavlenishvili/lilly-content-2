import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ExtendedContentfulService } from 'src/app/services/contentful.service';
import { BlogPageId, BlogService } from '../../blog.service';
import { IArticle, IBlogSettingsFields } from '../../../contentful/models/contentful';
import { UiLayoutGridService } from '@careboxhealth/layout1-shared';
import { BlogArticleCardComponent } from '../../components/blog-article-card/blog-article-card.component';
import { BlogPageSkeletonLoaderComponent } from 'src/app/shared-features/ui/loaders/blog-page-skeleton-loader/blog-page-skeleton-loader.component';
import {SectionWrapperModule} from '../../../../shared-features/ui/components/section-wrapper/section-wrapper.module';

@Component({
  selector: 'lilly-blog-search',
  templateUrl: './blog-search.component.html',
  styleUrls: ['./blog-search.component.scss'],
  imports: [
    BlogArticleCardComponent,
    BlogPageSkeletonLoaderComponent,
      SectionWrapperModule
  ],
  standalone: true
})
export class BlogSearchComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  articles: IArticle[] = [];
  searchTitle: string;
  loading = true;
  isMobile: boolean;
  breakPoint: number = 3;
  loadersAmount = 4;

  constructor(
    private contentfulService: ExtendedContentfulService,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private uiGridService: UiLayoutGridService,
  ) { }

  ngOnInit(): void {
    this.blogService.blogSettings$
      .pipe(
        filter(blogSettings => !!blogSettings),
        tap((blogSettings: IBlogSettingsFields) => {
          this.blogService.applyBlogPageMetadata(blogSettings?.pageMetaAndShare, BlogPageId.SEARCH);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    this.isMobile = this.uiGridService.gridSize < this.breakPoint;

    this.route.params
      .pipe(
        switchMap(params => {
          this.searchTitle = params['search'];
          const payload = {
            order: '-fields.publishDate',
            query: params['search'],
            'fields.archived': this.blogService.getIsShowArchivedArticles() ? undefined : false
          };
          return this.contentfulService.getArticles(payload);
        })).subscribe(res => {
        this.articles = this.getSortingArticles(res?.items as IArticle[]);
        this.loading = false;
      });

  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = this.uiGridService.gridSize < this.breakPoint;
  }

  getSortingArticles(articles: IArticle[]): IArticle[] {
    if (!articles?.length) {
      return [];
    }

    return articles.sort((a, b) => Number(b.fields.pinned) - Number(a.fields.pinned));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
