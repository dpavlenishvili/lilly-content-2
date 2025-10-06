import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ExtendedContentfulService } from '../../../../services/contentful.service';
import { ClientRoutes } from '../../../../common/client-routes';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { AnalyticsService } from '@careboxhealth/core';
import { IArticle, IBlogSettingsFields } from 'src/app/components/contentful/models/contentful';
import { BlogPageId, BlogService } from '../../blog.service';
import { UiLayoutGridService } from '@careboxhealth/layout1-shared';
import { AuthorSlug } from '../../enums/author-slug.enum';
import { CmsEntryId } from '../../../../enums/cms-entry-id';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lilly-blog-team-about',
  templateUrl: './blog-team-about.component.html',
  styleUrls: ['./blog-team-about.component.scss'],
  imports: [
    RouterLink
  ],
  standalone: true
})
export class BlogTeamAboutComponent implements OnInit, OnDestroy {
  readonly ClientRoutes = ClientRoutes;
  readonly AuthorSlug = AuthorSlug;
  pageFields: any;
  isMobile: boolean;
  breakPoint = 3;
  destroy$ = new Subject();

  constructor(private contentfulService: ExtendedContentfulService,
              private uiGridService: UiLayoutGridService,
              private analytics: AnalyticsService,
              private blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.blogService.blogSettings$
      .pipe(
        filter(blogSettings => !!blogSettings),
        tap((blogSettings: IBlogSettingsFields) => {
          this.blogService.applyBlogPageMetadata(blogSettings?.pageMetaAndShare, BlogPageId.ABOUT);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    this.analytics.write({action: 'ViewedMeetTheTeam'});

    this.isMobile = this.uiGridService.gridSize < this.breakPoint;
    combineLatest([this.contentfulService.getEntry(CmsEntryId.AboutBlog), this.contentfulService.getArticles()])
      .subscribe(([res, articlesRes]: any) => {
        this.pageFields = res?.fields ?
          {
            ...res.fields,
            featuredAuthors: res.fields.featuredAuthors?.map(author => ({
              ...author,
              hasArticles: !!articlesRes?.items?.find((article: IArticle) => article?.fields?.author?.sys?.id === author?.sys?.id)
            }))
          } : null;
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = this.uiGridService.gridSize < this.breakPoint;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
