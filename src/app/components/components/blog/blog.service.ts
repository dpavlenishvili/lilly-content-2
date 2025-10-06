import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IBlogSettingsFields, IMetaAndShare } from '../contentful/models/contentful';
import { ExtendedContentfulService } from '../../services/contentful.service';
import {map, take, tap} from 'rxjs/operators';
import { Asset, Entry } from 'contentful';
import { CmsEntryId } from '../../enums/cms-entry-id';

export enum BlogPageId {
  HOME = 'home',
  ARTICLE = 'article',
  SEARCH = 'search',
  AUTHOR = 'author',
  ABOUT = 'about',
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private isShowArchivedArticles$ = new BehaviorSubject(false);
  private _blogSettings$: BehaviorSubject<IBlogSettingsFields> = new BehaviorSubject<IBlogSettingsFields>(null);
  blogSettings$ = this._blogSettings$.asObservable();

  constructor(private contentfulService: ExtendedContentfulService) {}

  updateIsShowArchivedArticles(isShow: boolean) {
    this.isShowArchivedArticles$.next(isShow);
  }

  getIsShowArchivedArticles(): boolean {
    return this.isShowArchivedArticles$.getValue();
  }

  getBlogSettings(): Observable<IBlogSettingsFields> {
    if (this._blogSettings$.getValue()) {
      return of(this._blogSettings$.getValue());
    }

    return this.contentfulService
      .getEntry(CmsEntryId.BlogSettings)
      .pipe(
        take(1),
        tap((blogSettings: Entry<IBlogSettingsFields>) => this._blogSettings$.next(blogSettings?.fields || {} as IBlogSettingsFields)),
        map((blogSettings: Entry<IBlogSettingsFields>) => blogSettings?.fields || {} as IBlogSettingsFields)
      );
  }

  applyBlogPageMetadata(pageMetaAndShare: IMetaAndShare[], blogPageId: BlogPageId, heroImage?: Asset): void {
    const metadata: IMetaAndShare = pageMetaAndShare?.find(meta => meta?.fields?.pageId === blogPageId);
    this.contentfulService.applyPageMetadata(metadata, heroImage);
  }
}
