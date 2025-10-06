import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Input, OnDestroy } from '@angular/core';
import { IAlertMeWidgetFields } from '../models/contentful';
import { SearchCriteria } from '../models/search-criteria';
import { GtmTriggerName } from '../../../enums/gtm-trigger-name';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { FiltersStateService } from '@careboxhealth/layout1-filters';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DeepGtmTriggerDirective } from '@careboxhealth/layout1-shared';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { TrialAlertsSignupService } from '../../../services/trial-alerts-signup.service';
import {CbCardBodyDirective, CbCardComponent} from '../../../shared-features/ui/components/cb-card/src/app/shared/card';

@Component({
  selector: 'lilly-alert-me-widget',
  templateUrl: './alert-me-widget.component.html',
  styleUrls: ['./alert-me-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatButton,
    DeepGtmTriggerDirective,
    MdToHtmlPipe,
    CbCardComponent,
    CbCardBodyDirective
  ],
  standalone: true
})
export class AlertMeWidgetComponent implements AfterViewInit, OnDestroy {
  @Input() alertMeWidgetFields: IAlertMeWidgetFields;
  @Input() filters: SearchCriteria;
  @Input() subsiteName: string;
  readonly alertMeId: string = 'alertme-banner';
  destroy$ = new Subject<void>();

  readonly GtmTriggerName = GtmTriggerName;
  private readonly trialAlertsSignupService = inject(TrialAlertsSignupService);

  constructor(private route: ActivatedRoute,
              private helperService: HelperService,
              private filtersStateService: FiltersStateService,
  ) {
  }

  public ngAfterViewInit(): void {
    const isAlertMeInRoute = this.route.snapshot.queryParams?.alertme;
    const locationId = this.route.snapshot.queryParams?.placeId;

    if (isAlertMeInRoute) {
      this.helperService.scrollToSection(this.alertMeId);
      if (locationId) {
        this.filtersStateService.setLocationByPlaceId(locationId).pipe(takeUntil(this.destroy$)).subscribe(() =>{
          this.goToTrialAlerts(true);
        });
      } else {
        this.goToTrialAlerts(true);
      }
    }
  }

  goToTrialAlerts(isScrollNeeded?: boolean): void {
    this.trialAlertsSignupService.goToTrialAlerts(this.filters, 'Sub Site', isScrollNeeded, this.subsiteName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
