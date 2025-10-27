import { Injectable } from '@angular/core';
import { Asset } from 'contentful';
import { LanguageService } from '../services/language.service';   
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ContentfulService, GlobalSeoService } from '@careboxhealth/core';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { IMetaAndShare } from '../components/contentful/models/contentful';


@Injectable({
  providedIn: 'root'
})
export class ExtendedContentfulService extends ContentfulService {
  private cache = {};
  /* eslint-disable @typescript-eslint/no-explicit-any */
  constructor(
    private languageService: LanguageService,
    private http: HttpClient,
    protected seo: GlobalSeoService
  ) {
    super(environment);
  }

  getEntries(payload): Observable<any> {
    const id = JSON.stringify(payload);
    if (this.cache[id]) {
      return of(this.cache[id]);
    }
    return super.getEntries(payload, this.languageService.selected.cmsCode).pipe(
      tap(response => {
        this.cache[id] = response;
      })
    );
  }

  getEntry(entryId, payload = {}): Observable<any> {
    const id = `${JSON.stringify(payload)}-${entryId}`;
    if (this.cache[id]) {
      return of(this.cache[id]);
    }
    return super.getEntry(entryId, this.languageService.selected.cmsCode, payload).pipe(
      tap(response => {
        this.cache[id] = response;
      })
    );
  }

  getEntryByKey<T>(contentType: string, key: string): Observable<T> {
    return this.getEntries({ content_type: contentType, 'fields.key': key }).pipe(
      map((res: { total: number; items: T[] }) => res?.items?.[0] as T)
    );
  }

  applyPageMetadata(metadata: IMetaAndShare, heroImage?: Asset): void {
    if (!metadata?.fields) {
      return;
    }

    const { metaTitle, metaDescription, metaKeywords, ogImage } = metadata.fields;

    if (metaTitle) {
      this.seo.setTitle(metaTitle);
    }

    if (metaDescription) {
      this.seo.setDescription(metaDescription);
    }

    if (metaKeywords?.length) {
      this.seo.setKeywords(metaKeywords.join(', '));
    }

    this.setSeoImage(ogImage || heroImage);
  }

  setSeoImage(image: Asset): void {
    const imgFile = image?.fields?.file;
    if (imgFile?.url) {
      this.seo.setImage(`https:${imgFile.url}`, { mimeType: imgFile.contentType });
    }
  }
}
