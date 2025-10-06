import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  AnalyticsService,
  ConfigurationProvider,
  CookieConsentService,
  LocationService,
  PrivacyProtection
} from '@careboxhealth/core';
import { HelperService } from 'src/app/services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import {
  CookiesConfigurationsDialogComponent
} from './cookies-configurations-dialog/cookies-configurations-dialog.component';
import { Subject } from 'rxjs';
import { CookieBannerService } from '../../services/cookie-banner.service';
import { filter, takeUntil } from 'rxjs/operators';
import {
  UsaCookieConfigurationDialogHomeComponent
} from './usa-cookie-configuration-dialog/usa-cookie-configuration-dialog-home/usa-cookie-configuration-dialog-home.component';
import {
  UsaCookieConfigurationDialogSettingsComponent
} from './usa-cookie-configuration-dialog/usa-cookie-configuration-dialog-settings/usa-cookie-configuration-dialog-settings.component';
import { ComponentType } from '@angular/cdk/portal';
import { NEVADA_CITIES, WASHINGTON_CITIES } from '../../constants/cities';
import { MatButton } from '@angular/material/button';
import { externalRoutes } from '../../configurations/links';

@Component({
  selector: 'lilly-cookies-banner',
  templateUrl: './cookies-banner.component.html',
  styleUrls: ['./cookies-banner.component.scss'],
  imports: [
    NgIf,
    MatButton
  ],
  standalone: true
})
export class CookiesBannerComponent implements OnInit, OnDestroy {

  static isNevadaWashington(city: string): boolean {
    if (!city) {
      return false;
    }
    const lowerCaseCity = city.toLowerCase();
    return [...NEVADA_CITIES, ...WASHINGTON_CITIES].some(
      (stateCity: string) => {
        return lowerCaseCity === stateCity.toLowerCase();
      }
    );
  }

  public visible = false;
  public readonly externalRoutes = externalRoutes;

  destroy$ = new Subject();

  constructor(
        private cookieConsentService: CookieConsentService,
        private helperService: HelperService,
        private configuration: ConfigurationProvider,
        public dialog: MatDialog,
        private cookieBannerService: CookieBannerService,
        private analyticsService: AnalyticsService,
        private locationService: LocationService
  ) {
  }

  get cookieBannerType(): PrivacyProtection {
    return this.configuration.getConfigurationEntry('privacyProtection');
  }

  get isPrivacyProtectionGDPR(): boolean {
    return this.cookieBannerType === PrivacyProtection.GDPR;
  }

  get isPrivacyProtectionCCPA(): boolean {
    return this.cookieBannerType === PrivacyProtection.CCPA;
  }

  ngOnInit(): void {
    if (!this.cookieConsentService.accepted) {
      this.analyticsService.geoCity$?.subscribe(city => {
        if (CookiesBannerComponent.isNevadaWashington(city)) {
          this.cookieConsentService.acceptOnlyNecessary();
        }
        this.initVisibility();
      });
    } else {
      this.initVisibility();
    }
  }

  initVisibility(): void {
    this.setVisibilityState();
    this.cookieBannerService.showCookieBanner.pipe(
      filter((isShow: boolean) => isShow),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.showCookieBanner();
    });
  }

  showCookieBanner(): void {
    switch (this.cookieBannerType) {
    case PrivacyProtection.CCPA:
      this.showShortCookieBanner();
      break;
    case PrivacyProtection.GDPR:
      this.showConfigurableCookieBanner();
      break;
    case PrivacyProtection.USA:
      this.showUSACookieBanner();
      break;
    }
  }

  showUSACookieBanner(): void {
    // eslint-disable-next-line max-len
    const DialogComponent: ComponentType<UsaCookieConfigurationDialogSettingsComponent | UsaCookieConfigurationDialogHomeComponent> = this.cookieConsentService.accepted
      ? UsaCookieConfigurationDialogSettingsComponent
      : UsaCookieConfigurationDialogHomeComponent;
    this.dialog.open(DialogComponent, {
      panelClass: ['cookies-dialog', 'usa-cookies-dialog'],
      autoFocus: false,
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter(() => !!this.locationService.hash)
      )
      .subscribe(() => {
        this.scrollToSection();
      });
  }

  setVisibilityState() {
    if (this.cookieConsentService.accepted) {
      this.visible = false;
      this.helperService.setBannerStatus({ status: this.visible });
    } else {
      this.showCookieBanner();
    }
  }

  onAccept(): void {
    this.cookieConsentService.accept();
    this.close();
  }

  onDismiss(): void {
    this.cookieConsentService.decline();
    this.close();
  }

  private showShortCookieBanner(): void {
    this.visible = true;
    this.helperService.setBannerStatus({ status: this.visible });
  }

  private showConfigurableCookieBanner(): void {
    this.visible = false;
    this.helperService.setBannerStatus({ status: this.visible });
    this.onConfigure(true);
  }

  private close() {
    this.visible = false;
    this.helperService.setBannerStatus({ status: this.visible });
  }

  public onConfigure(isAutoOpen = false) {
    const dialogRef = this.dialog.open(CookiesConfigurationsDialogComponent, {
      panelClass: 'cookies-dialog',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.close();
      }

      if (this.locationService.hash && isAutoOpen) {
        this.scrollToSection();
      }
    });
  }

  private scrollToSection(): void {
    window.requestAnimationFrame(() => {
      this.helperService.scrollToSection(this.locationService.hash.substring(1));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
