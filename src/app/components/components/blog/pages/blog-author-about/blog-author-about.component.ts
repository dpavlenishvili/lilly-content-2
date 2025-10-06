import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ExtendedContentfulService } from 'src/app/services/contentful.service';
import { BlogPageId, BlogService } from '../../blog.service';
import { IArticle, IAuthorFields, IBlogSettingsFields } from '../../../contentful/models/contentful';
import { BlogArticleCardComponent } from '../../components/blog-article-card/blog-article-card.component';
import { GlobalSeoService } from '@careboxhealth/core';

@Component({
  selector: 'lilly-blog-author-about',
  templateUrl: './blog-author-about.component.html',
  styleUrls: ['./blog-author-about.component.scss'],
  imports: [
    BlogArticleCardComponent
  ],
  standalone: true
})
export class BlogAuthorAboutComponent implements OnInit {
  destroy$ = new Subject();
  authorInfo: IAuthorFields;
  articles: IArticle[] = [];

  constructor(
    private contentfulService: ExtendedContentfulService,
    private blogService: BlogService,
    private route: ActivatedRoute,
    protected seo: GlobalSeoService,
    protected titleService: Title
  ) {}

  ngOnInit(): void {
    this.blogService.blogSettings$
      .pipe(
        filter(blogSettings => !!blogSettings),
        tap((blogSettings: IBlogSettingsFields) => {
          this.blogService.applyBlogPageMetadata(blogSettings?.pageMetaAndShare, BlogPageId.AUTHOR);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    this.route.params
      .pipe(
        switchMap(params =>
          this.contentfulService.getEntries({
            content_type: 'author',
            'fields.slug': params['author-name']
          })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((entry: any) => {
        this.authorInfo = entry?.items[0]?.fields;
        this.seo.setTitle(`${this.authorInfo?.name}, ${this.titleService.getTitle()}`);
        const payload = {
          order: '-fields.publishDate',
          'fields.author.sys.id': entry?.items[0]?.sys.id,
          'fields.archived': this.blogService.getIsShowArchivedArticles() ? undefined : false
        };

        this.contentfulService.getArticles(payload).subscribe(res => {
          this.articles = res.items as IArticle[];
        });
      });
  }
}
