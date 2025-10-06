import { Component } from '@angular/core';
import { ConfigurationProvider, AnalyticsService, CookieConsentService } from '@careboxhealth/core';
import { ClientRoutes } from '../../common/client-routes';
import { externalRoutes } from '../../configurations/links';
import { HelperService } from 'src/app/services/helper.service';
import { FooterComponent, ShowForRegionsDirective, HideForRegionsDirective, UiLayoutGridService } from '@careboxhealth/layout1-shared';
import { CookieBannerService } from '../../services/cookie-banner.service';
import { Language } from '../../enums/language';
import { environment } from '../../../environments/environment';
import { ToggleFeatureHelperService } from '../../services/toggle-feature-helper.service';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconAnchor } from '@angular/material/button';

@Component({
  selector: 'lilly-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    NgClass,
    NgTemplateOutlet,
    ShowForRegionsDirective,
    HideForRegionsDirective,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    MatIconAnchor,
  ],
  standalone: true
})
export class LocalFooterComponent extends FooterComponent {
  currentYear: number = new Date().getFullYear();
  newRoutes = externalRoutes;
  breakPoint = 2;
  readonly Language: typeof Language = Language;
  public readonly environment = environment;
  topLinks = [
    {
      link: externalRoutes.Diversity,
      text: $localize`:@@footer.diversity:Diversity`
    },
    {
      link: externalRoutes.Contact,
      text: $localize`:@@footer.get_in_touch:Get in touch`
    },
    {
      link: externalRoutes.Suppliers,
      text: $localize`:@@footer.suppliers:Suppliers`
    },
    {
      link: externalRoutes.SocialMediaGuidelines,
      text: $localize`:@@footer.social_media_guidelines:Social Media Guidelines`,
    }
  ];

  constructor(
      protected configuration: ConfigurationProvider,
      protected analytics: AnalyticsService,
      protected helperService: HelperService,
      public uiGridService: UiLayoutGridService,
      protected cookieConsentService: CookieConsentService,
      protected cookieBannerService: CookieBannerService,
      public readonly toggleFeatureHelperService: ToggleFeatureHelperService
  ) {
    super(configuration, analytics);
  }

  get defaultCultureCode() {
    return this.configuration.defaultCultureCode;
  }

  get clientLocalRoutes() {
    return ClientRoutes;
  }

  get isCookieAccepted(): boolean {
    return this.cookieConsentService.accepted;
  }

  goToLink(link: string, target: string = '_blank'): void {
    const routeKey = this.getKeyByValue(this.newRoutes, link);
    const entries = {
      action: `${routeKey}Click`
    };
    this.analytics.write(entries);
    const language = this.defaultCultureCode.toLowerCase() as Language;
    const isCanada = [Language.fr_CA, Language.en_CA].includes(language);
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
