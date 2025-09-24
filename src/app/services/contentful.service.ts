import { Injectable } from '@angular/core';
import { Asset } from 'contentful';
import { LanguageService } from '../services/language.service';   
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ContentfulService, GlobalSeoService } from '@careboxhealth/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IHomePage, IMetaAndShare } from '../components/contentful/models/contentful';


@Injectable({
  providedIn: 'root'
})
export class ExtendedContentfulService extends ContentfulService {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  constructor(
    private languageService: LanguageService,
    private http: HttpClient,
    protected seo: GlobalSeoService
  ) {
    super(environment);
  }

  getEntries(payload): any {
    return super.getEntries(payload, this.languageService.selected.cmsCode);
  }

  getEntry(entryId, payload = {}) {
    return super.getEntry(entryId, this.languageService.selected.cmsCode, payload);
  }

  getHomePage(): Observable<IHomePage> {
    return this.getEntries({ content_type: 'homePage', 'fields.key': 'home-page' }).pipe(
      map((res: { total: number; items: IHomePage[] }) => res?.items?.[0])
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
