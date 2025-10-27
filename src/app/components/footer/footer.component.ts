import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnalyticsService, ConfigurationProvider, CookieConsentService } from '@careboxhealth/core';
import { HelperService } from '../../services/helper.service';
import { FooterComponent } from '@careboxhealth/layout1-shared';
import { CookieBannerService } from '../../services/cookie-banner.service';
import { environment } from '../../../environments/environment';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconAnchor } from '@angular/material/button';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { IFooter, IFooterFields, ILink } from '../contentful/models/contentful';
import { MdToHtmlPipe } from '../../pipes/md-to-html.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RouterLinkWithAccessDirective } from '../../directives/router-link-with-access.directive';

@Component({
  selector: 'lilly-content-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    NgClass,
    NgTemplateOutlet,
    RouterLinkActive,
    MatIconAnchor,
    MdToHtmlPipe,
    RouterLink,
    RouterLinkWithAccessDirective
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalFooterComponent extends FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly environment = environment;

  protected readonly helperService: HelperService = inject(HelperService);
  protected readonly cookieConsentService: CookieConsentService = inject(CookieConsentService);
  protected readonly cookieBannerService: CookieBannerService = inject(CookieBannerService);
  private readonly contentful: ExtendedContentfulService = inject(ExtendedContentfulService);

  readonly footerFields = toSignal<IFooterFields | null>(
    this.contentful.getEntries({ content_type: 'footer', 'fields.key': 'footer' }).pipe(
      map((response: { items: IFooter[] }) => response.items?.[0]?.fields ?? null)
    ),
    { initialValue: null }
  );

  constructor(
    protected readonly configuration: ConfigurationProvider,
    protected readonly analytics: AnalyticsService
  ) {
    super(configuration, analytics);
  }

  get isCookieAccepted(): boolean {
    return this.cookieConsentService.accepted;
  }

  onLinkClick(link: ILink, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.helperService.goToLink(link?.fields?.url, link?.fields?.linkBehavior);
  }

  showCookiesSettings(): void {
    this.cookieBannerService.showCookieBanner.next(true);
  }
}
