import { Component, inject } from '@angular/core';
import { ConfigurationProvider, AnalyticsService, CookieConsentService, LanguageCode } from '@careboxhealth/core';
import { ClientRoutes } from '../../common/client-routes';
import { externalRoutes } from '../../configurations/links';
import { HelperService } from '../../services/helper.service';
import { FooterComponent } from '@careboxhealth/layout1-shared';
import { CookieBannerService } from '../../services/cookie-banner.service';
import { environment } from '../../../environments/environment';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconAnchor } from '@angular/material/button';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { AppIconRegistry } from '../../services/app-icon-registry.service';

@Component({
  selector: 'lilly-content-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    NgClass,
    NgTemplateOutlet,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    MatIconAnchor,
    LanguageSwitcherComponent
  ],
  standalone: true
})
export class LocalFooterComponent extends FooterComponent {
  currentYear: number = new Date().getFullYear();
  newRoutes = externalRoutes;
  public readonly environment = environment;

  protected readonly helperService: HelperService = inject(HelperService);
  protected readonly cookieConsentService: CookieConsentService = inject(CookieConsentService);
  protected readonly cookieBannerService: CookieBannerService = inject(CookieBannerService);
  private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);

  constructor(protected readonly configuration: ConfigurationProvider, protected readonly analytics: AnalyticsService) {
    super(configuration, analytics);
    this.registerIcons();
  }

  get clientLocalRoutes() {
    return ClientRoutes;
  }

  get isCookieAccepted(): boolean {
    return this.cookieConsentService.accepted;
  }

  registerIcons(): void {
    this.iconRegistry.addSvgIcon('logo-footer', '/assets/svg/lilly/logo-footer.svg');
    this.iconRegistry.addSvgIcon('network', '/assets/svg/lilly/network.svg');
  }

  goToLink(link: string, target: string = '_blank'): void {
    const routeKey = this.getKeyByValue(this.newRoutes, link);
    const entries = {
      action: `${routeKey}Click`
    };
    this.analytics.write(entries);
    const language = this.configuration.defaultCultureCode.toLowerCase() as LanguageCode;
    const isCanada = [LanguageCode.fr_CA, LanguageCode.en_CA].includes(language);
    this.helperService.openDialog(link, target, {}, undefined, undefined, {
      disableLeaveToLillySite: isCanada
    });
  }

  onSitemapClick() {
    const entries = { action: 'SitemapClick' };
    this.analytics.write(entries);
  }

  onFAQClick() {
    const entries = { action: 'FAQClick' };
    this.analytics.write(entries);
  }

  onSocialLogoClick(networkName: string) {
    const entries = {
      action: 'SocialClick',
      socialNetwork: networkName
    };
    this.analytics.write(entries);
  }

  showCookiesSettings() {
    this.cookieBannerService.showCookieBanner.next(true);
  }

  private getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
}
