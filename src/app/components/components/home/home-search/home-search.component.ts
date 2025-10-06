import {ChangeDetectionStrategy, Component, HostListener, inject, input, InputSignal} from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { PrimaryFiltersComponent } from '../../primary-filters/primary-filters.component';
import {
  CheckPartnerFeaturesDirective,
  DeepGtmTriggerDirective,
  ShowForRegionsDirective,
  ToggleFeature,
  UiLayoutGridService
} from '@careboxhealth/layout1-shared';
import { PrimaryFiltersService } from '../../../services/primary-filters.service';
import { ClientRoutes } from '../../../common/client-routes';
import { GtmTriggerName } from '../../../enums/gtm-trigger-name';
import { InfoBoxComponent } from '../../info-box/info-box.component';
import { ToggleFeatureHelperService } from '../../../services/toggle-feature-helper.service';
import { Language } from '../../../enums/language';
import { AnalyticsService } from '@careboxhealth/core';
import { IImageAssetFields } from '../../contentful/models/contentful';

@Component({
  selector: 'lilly-home-search',
  standalone: true,
  imports: [
    MatAnchor,
    MatIcon,
    RouterLink,
    PrimaryFiltersComponent,
    DeepGtmTriggerDirective,
    InfoBoxComponent,
    ShowForRegionsDirective,
    CheckPartnerFeaturesDirective
  ],
  templateUrl: './home-search.component.html',
  styleUrl: './home-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSearchComponent {
  private readonly locationStrategy = inject(LocationStrategy);
  private readonly primaryFiltersService = inject(PrimaryFiltersService);
  private readonly analytics = inject(AnalyticsService);
  public readonly toggleFeatureHelperService = inject(ToggleFeatureHelperService);
  private uiGridService = inject(UiLayoutGridService);
  protected readonly GtmTriggerName = GtmTriggerName;
  protected readonly ClientRoutes = ClientRoutes;
  protected readonly Language = Language;
  readonly listingLink: string = this.locationStrategy.prepareExternalUrl(ClientRoutes.Listing);
  readonly questionnaireLink: string = this.locationStrategy.prepareExternalUrl(ClientRoutes.Matching);
  protected readonly ToggleFeature: typeof ToggleFeature = ToggleFeature;
  heroImageHomeSrc: InputSignal<IImageAssetFields>= input(null);
  breakPoint = 3;
  isMobile = this.uiGridService.gridSize < this.breakPoint;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = this.uiGridService.gridSize < this.breakPoint;
  }

  navigateToTrials(): void {
    this.primaryFiltersService.navigateToTrials();
    this.analytics.write({action: 'FindButtonHomeClick'});
  }

  navigateToQuestionnaire(): void {
    this.primaryFiltersService.navigateToQuestionnaire();
    this.analytics.write({action: 'MatchingButtonHomeClick'});
  }
}
