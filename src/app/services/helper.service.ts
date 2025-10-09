import { inject, Injectable, Type } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LeaveLillyDialogComponent } from '../components/leave-lilly-dialog/leave-lilly-dialog.component';
import { AnalyticsService, ConfigurationProvider, LanguageCode, LinkBehavior } from '@careboxhealth/core';
import {
  LeaveToLillySiteDialogComponent
} from '../components/leave-to-lilly-site-dialog/leave-to-lilly-site-dialog.component';
import { take } from 'rxjs/operators';
import { LeaveCountryDialogComponent } from '../components/leave-country-dialog/leave-country-dialog.component';
import { LinkTarget, HelperService as SharedHelperService } from '@careboxhealth/layout1-shared';
import { BehaviorSubject } from 'rxjs';
import { Location, LocationStrategy, ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const ROUTES_SEPARATOR = '/';

export enum LeaveDialogType {
  LEAVE = 'leave',
  PREQUALIFY = 'preQualify',
}


type LeaveDialogComponent =
  LeaveCountryDialogComponent
  | LeaveLillyDialogComponent
  | LeaveToLillySiteDialogComponent;

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private cookieBanner$: BehaviorSubject<{ status: boolean; }> = new BehaviorSubject({ status: true });

  protected readonly configuration: ConfigurationProvider = inject(ConfigurationProvider);
  private readonly viewportScroller: ViewportScroller = inject(ViewportScroller);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly analytics: AnalyticsService = inject(AnalyticsService);
  private readonly sharedHelperService: SharedHelperService = inject(SharedHelperService);
  private readonly router: Router = inject(Router);
  protected readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly location: Location = inject(Location);
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
  protected locationStrategy = inject(LocationStrategy);

  goToLink(link: string, linkBehavior: LinkBehavior | string, analyticsObj?: {[key: string]: unknown}): void {
    this.sendAnalytics(analyticsObj, analyticsObj?.actionsArr[0]);

    if (linkBehavior === LinkBehavior.SameTab) {
      if (link[0] === ROUTES_SEPARATOR) {
        this.goToRouterLink(link);
        return;
      }

      this.openDialog(link, LinkTarget.Self, null, null, analyticsObj);
      return;

    } else if (linkBehavior === LinkBehavior.Interstitial || linkBehavior === 'external') {
      this.openDialog(link, LinkTarget.Blank, {}, LeaveDialogType.LEAVE, analyticsObj);
      return;

    } else if (linkBehavior === 'interstitialCollaboration') {
      this.openDialog(link, LinkTarget.Blank, {}, LeaveDialogType.PREQUALIFY, analyticsObj);
      return;
    }

    this.openDialog(link, LinkTarget.Blank, null, null, analyticsObj);
  }

  private goToRouterLink(link: string): void {
    const linkSegments = link.split(/[?#]/);
    const routes = linkSegments[0].split(ROUTES_SEPARATOR);
    routes.shift();

    // It means that url doesn't include query params and hash
    if (linkSegments.length === 1) {
      void this.router.navigate(routes);
      return;
    }

    // It means that url includes query params and hash
    if (linkSegments.length === 3) {
      void this.router.navigate(routes, {
        queryParams: this.parseQueryParams(linkSegments[1]),
        fragment: linkSegments[2]
      });
      return;
    }

    // It means that url includes query params
    if (link.includes('?')) {
      void this.router.navigate(routes, { queryParams: this.parseQueryParams(linkSegments[1]) });
      return;
    }

    // It means that url includes hash
    if (link.includes('#')) {
      void this.router.navigate(routes, { fragment: linkSegments[1] });
      return;
    }
  }

  parseQueryParams(queryParams: string): Params {
    const params = new URLSearchParams(queryParams);
    const result: Params = {};
    params.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }

  shouldOpenLeavingCountryPopup(link: string): boolean {
    if (this.disabledConfirmLeaveCountry) {
      return false;
    }

    let path: string;
    if (link.startsWith('/')) {
      path = link;
    } else {
      if (!link.startsWith('http')) {
        link = `https://${link};`;
      }
      try {
        const url = new URL(link);
        if (url.origin !== location.origin) {
          return false;
        }
        path = url.pathname;
      } catch {
        //
      }
    }
    if (!path) {
      return false;
    }
    if (path[0] === '/') {
      path = path.slice(1);
    }
    const currentCountry = this.configuration.defaultCultureCode.split('-')[1];
    const toCountry = path.split('/')[0].split('-')[1];
    return currentCountry && toCountry && toCountry !== currentCountry;
  }

  prepareContentfulLink(link: string): string {
    if (link.startsWith('/')) {
      return this.locationStrategy.prepareExternalUrl(link);
    }

    return link;
  }

  openDialog(
    link: string,
    target: LinkTarget = LinkTarget.Blank,
    data: {[key: string]: unknown} = {},
    type?: LeaveDialogType,
    analyticsObj?: {[key: string]: unknown},
    options: {
      disableLeaveToLillySite?: boolean
    } = {}
  ) {
    const domain = 'lilly.com';


    let dialogRef: MatDialogRef<LeaveDialogComponent>;
    let component: Type<LeaveDialogComponent>;

    const leaveToLillyLocales = [];
    if (!options.disableLeaveToLillySite && link.indexOf(domain) > -1 &&
      leaveToLillyLocales.includes(this.configuration.defaultCultureCode?.toLowerCase())
    ) {
      component = LeaveToLillySiteDialogComponent;
    } else if ((this.isItaly && type) || this.shouldOpenLeavingCountryPopup(link)) {
      component = LeaveCountryDialogComponent;
    } else if (type === LeaveDialogType.LEAVE) {
      component = LeaveLillyDialogComponent;
    }

    if (component) {
      dialogRef = this.dialog.open(component, {
        panelClass: 'leave-lilly-dialog',
        ariaLabelledBy: 'leaveLillyDialogLabel',
        autoFocus: false,
        restoreFocus: false,
        data: {
          ...data,
          link,
          target
        }
      });
      this.handleDialogRef(dialogRef, analyticsObj);
    } else {
      this.sharedHelperService.windowOpen(link, target);
    }
    return dialogRef;
  }

  setVideoSrc(videoUrl: string, autoplay: '1' | '0' = '1'): { isIframe: boolean; videoSrc: string | SafeResourceUrl } {
    if (!videoUrl) {
      return;
    }

    if (this.isAllowedVideoFormat(videoUrl)) {
      return { isIframe: false, videoSrc: videoUrl };
    } else {
      // Get the search params from the URL
      const url: URL = new URL(videoUrl);
      const searchParams: URLSearchParams = new URLSearchParams(url.search);
      const defaultParams: {
        rel: string;
        autoplay: string;
        loop: string;
        mute: string;
      } = {
        rel: '0',
        autoplay,
        loop: '1',
        mute: '1'
      };

      // update query params
      Object.keys(defaultParams).forEach(key => {
        if (searchParams.get(key)) {
          return;
        }
        searchParams.set(key, defaultParams[key]);
      });

      // get youtube video Id from link
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match: RegExpMatchArray | null = videoUrl.match(regExp);

      if (match?.length) {
        videoUrl = 'https://www.youtube.com/embed/' + match[2];
      } else {
        videoUrl = url.origin + url.pathname;
      }

      return {
        isIframe: true,
        videoSrc: this.sanitizer.bypassSecurityTrustResourceUrl(`${videoUrl}?${searchParams.toString()}`)
      };
    }
  }

  private handleDialogRef(dialogRef: MatDialogRef<LeaveDialogComponent>, analyticsObj?: {[key: string]: unknown}) {
    dialogRef.afterClosed().pipe(take(1)).subscribe(data => {
      if (!data) {
        return;
      }
      this.sendAnalytics(analyticsObj, analyticsObj?.actionsArr[1]);
    });
  }

  public sendAnalytics(analyticsObj: {[key: string]: unknown}, action: string): void {
    if (!Object.keys(analyticsObj || {}).length) {
      return;
    }

    const sendObject = { ...analyticsObj, action } as {[key: string]: unknown};
    delete sendObject?.actionsArr;
    this.analytics.write(sendObject);
  }

  public setBannerStatus(status: {status: boolean;}): void {
    this.cookieBanner$.next(status);
  }

  public scrollToSection(section: string, offsetEls?: string[]): void {
    if (!section) {
      return;
    }

    const targetEl = document.getElementById(section);
    if (!targetEl) {
      return;
    }

    const offset = this.getScrollOffset(offsetEls);
    const elementTop = targetEl.getBoundingClientRect().top + window.scrollY;

    this.viewportScroller.scrollToPosition([0, elementTop - offset]);
    this.setScrollOffset();
  }

  public getScrollOffset(offsetEls: string[] = ['cookie-banner', 'lilly-header']): number {
    return offsetEls.reduce((currentOffset, elementId) => currentOffset + (document.getElementById(elementId)?.offsetHeight || 0), 0);
  }

  public setScrollOffset(): void {
    const offset = this.getScrollOffset();
    this.viewportScroller.setOffset([0, offset]);
  }

  public isAllowedVideoFormat(videoUrl: string): boolean {
    const allowedVideoFormat: string[] = ['.mp4', '.ogv', '.ogm', '.ogg', '.webm'];
    return allowedVideoFormat.some((format: string) => videoUrl.toLowerCase().includes(format));
  }

  get isItaly(): boolean {
    return this.configuration.defaultCultureCode?.toLowerCase() === LanguageCode.it_IT;
  }

  get disabledConfirmLeaveCountry(): boolean {
    return !this.isItaly;
  }

  async downloadFile(fileUrl: string, fileName: string = 'download.pdf'): Promise<void> {
    if (!fileUrl) return;

    const response = await fetch(fileUrl.startsWith('http') ? fileUrl : `https:${fileUrl}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  sendEmailWithFile(fileUrl: string, subject?: string): void {
    if (!fileUrl) {
      return;
    }

    const absoluteUrl = fileUrl.startsWith('http') ? fileUrl : `https:${fileUrl}`;

    const emailSubject = subject ? encodeURIComponent(subject) : '';
    const emailBody = encodeURIComponent(absoluteUrl);
    const mailto = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    
    this.sharedHelperService.windowOpen(mailto, LinkTarget.Self);
  }

  async printFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    const url = fileUrl.startsWith('http') ? fileUrl : `https:${fileUrl}`;

    try {
      const res = await fetch(url);
      const blobUrl = URL.createObjectURL(await res.blob());
      const iframe = Object.assign(document.createElement('iframe'), {
        src: blobUrl,
      });
      document.body.appendChild(iframe);

      iframe.onload = () => {
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow || !iframeWindow.focus || !iframeWindow.print) return;

        iframeWindow.focus();
        iframeWindow.print();

        iframeWindow.addEventListener('afterprint', () => {
          URL.revokeObjectURL(blobUrl);
          iframe.remove();
        });
      };
    } catch {
      this.sharedHelperService.windowOpen(url, LinkTarget.Blank);
    }
  }
}

