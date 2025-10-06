import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ClientRoutes } from '../../common/client-routes';
import { LocationStrategy, NgClass, NgTemplateOutlet } from '@angular/common';
import { PrimaryFiltersService } from '../../services/primary-filters.service';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DeepGtmTriggerDirective, ShowForRegionsDirective } from '@careboxhealth/layout1-shared';
import { PrimaryFiltersComponent } from '../primary-filters/primary-filters.component';
import { GtmTriggerName } from '../../enums/gtm-trigger-name';
import { Language } from '../../enums/language';

@Component({
  standalone: true,
  selector: 'lilly-find-clinical-trial',
  templateUrl: './find-clinical-trial.component.html',
  styleUrls: ['./find-clinical-trial.component.scss'],
  imports: [
    MatAnchor,
    MatIcon,
    RouterLink,
    ShowForRegionsDirective,
    PrimaryFiltersComponent,
    NgClass,
    NgTemplateOutlet,
    DeepGtmTriggerDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindClinicalTrialComponent {
  private readonly locationStrategy = inject(LocationStrategy);
  private readonly primaryFiltersService = inject(PrimaryFiltersService);
  protected readonly GtmTriggerName = GtmTriggerName;
  protected readonly ClientRoutes = ClientRoutes;
  protected readonly Language = Language;
  @Input() containerClass: string = 'container';
  @Input() wrapClass: string = '';
  @Input() contentColClass: string = '';

  listingLink: string = this.locationStrategy.prepareExternalUrl(ClientRoutes.Listing);

  navigateToTrials(isCompletedTrials: boolean): void {
    this.primaryFiltersService.navigateToTrials(isCompletedTrials);
  }
}
