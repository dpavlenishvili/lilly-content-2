import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractDynamicFiltersComponent,
  MAIN_FILTERS_HOME_GEO,
  MAIN_FILTERS_TERM_SEARCH
} from '@careboxhealth/layout1-filters';
import { ListingStore, ListingStoreType, FilterConfiguration } from '@careboxhealth/core';

@Component({
  selector: 'lilly-primary-filters',
  standalone: true,
  templateUrl: './primary-filters.component.html',
  imports: [
    AbstractDynamicFiltersComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimaryFiltersComponent {
  protected readonly store: ListingStoreType = inject(ListingStore);
  protected readonly filtersList: FilterConfiguration[] = [
    MAIN_FILTERS_TERM_SEARCH,
    MAIN_FILTERS_HOME_GEO
  ];
}
