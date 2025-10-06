import { Component, OnInit } from '@angular/core';
import { ClientRoutes } from '../../common/client-routes';
import { AnalyticsAction, AnalyticsService, ConfigurationProvider } from '@careboxhealth/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityType } from 'src/app/enums/entity-type';
import { LanguageService } from '../../shared-features/ui/language.service';
import { filter } from 'rxjs/operators';
import { HelperService } from '../../services/helper.service';
import { ExtRedirectQueryParam } from '../../enums/ext-redirect-query-param';

@Component({
  selector: 'app-not-support',
  templateUrl: './not-support.component.html',
  standalone: true
})

export class NotSupportComponent implements OnInit {
  currentLanguage = '';
  queryParams: any;
  readonly EntityType: typeof EntityType = EntityType;

  constructor(
      protected configuration: ConfigurationProvider,
      protected router: Router,
      protected route: ActivatedRoute,
      private languageService: LanguageService,
      protected analyticsService: AnalyticsService,
      private helperService: HelperService,
  ) { }

  ngOnInit(): void {
    this.queryParams = {...this.route.snapshot.queryParams};
    const requestedLanguageCode = this.route.snapshot.params?.langCode || this.configuration.defaultLanguageLCID;
    this.currentLanguage = this.queryParams?.langAlias || requestedLanguageCode;
    let originalUrl = this.queryParams?.originalUrl;
    if (originalUrl) {
      originalUrl = decodeURIComponent(originalUrl);
      this.analyticsService.write({
        action: AnalyticsAction.ERROR_PAGE,
        prevUrl: originalUrl,
      });
    }
    this.helperService.removeExtRedirectQueryParams([ExtRedirectQueryParam.ExternalRequestId, ExtRedirectQueryParam.OriginalUrl]);
  }

  goToHomePage(): void {
    void this.router.navigate([ClientRoutes.Home]);
  }

  goToTrialPage(): void {
    if (this.queryParams?.payload) {
      const payload = JSON.parse(atob(this.queryParams.payload));
      const enUSTrialLink = payload.availableLangs['en-US']['route'];

      this.languageService.requestConfirmLeaveCountry('US').pipe(
        filter(shouldSwitch => shouldSwitch),
      ).subscribe(() => {
        const url = window.location.origin + enUSTrialLink;
        window.open(url, '_self');
      });

    }
  }
}
