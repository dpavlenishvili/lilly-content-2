import { ChangeDetectionStrategy, Component, computed, effect, input, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IDayProgram, IWeekPlannerNavigationFields } from '../models/contentful';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { DayProgramBlockComponent } from '../day-program-block/day-program-block.component';
import {
  ContainerWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/container-wrapper/container-wrapper.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulesStateService } from '../../../services/modules-state.service';
import { map } from 'rxjs/operators';
import { QueryParams } from '../../../constants/query-params';
import { RoutePaths } from '../../../constants/routes';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'lilly-content-week-planner-navigation-bar',
  templateUrl: './week-planner-navigation-bar.component.html',
  styleUrls: ['./week-planner-navigation-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OneRowNavigationComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatButton,
    DayProgramBlockComponent,
    ContainerWrapperComponent
  ],
  standalone: true
})
export class WeekPlannerNavigationBarComponent {
  readonly weekPlannerNavigationBarFields = input<IWeekPlannerNavigationFields | undefined>();
  readonly fields = computed(() => this.weekPlannerNavigationBarFields());
  readonly selectedMenuItem = signal<IDayProgram | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modulesState = inject(ModulesStateService);
  private readonly helper = inject(HelperService);

  readonly currentDaySlug = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get(QueryParams.Day))),
    { initialValue: null }
  );

  readonly currentModuleSlug = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get(QueryParams.Module))),
    { initialValue: null }
  );

  constructor() {
    effect(() => {
      const fields = this.weekPlannerNavigationBarFields();
      const days = fields?.days ?? [];
      
      if (!days?.length) {
        this.selectedMenuItem.set(null);
        return;
      }

      const selectedDaySlug = this.modulesState.getSelectedDaySlug();
      const daySlug = this.currentDaySlug() || selectedDaySlug;
      const matched = days.find(d => d?.fields?.slug === daySlug) || days[0];
      this.selectedMenuItem.set(matched);
    }, { allowSignalWrites: true });

    effect(() => {
      const daySlug = this.currentDaySlug();
      const moduleSlug = this.currentModuleSlug();
      
      if (daySlug && moduleSlug) {
        this.modulesState.setSelectedDaySlug(moduleSlug, daySlug);
      }
    });
  }

  onMenuItemClick(item: IDayProgram): void {
    this.selectedMenuItem.set(item);
    const selectedModule = this.modulesState.selectedModule();
    const moduleSlug = selectedModule?.fields?.slug;
    
    if (moduleSlug && item?.fields?.slug) {
      this.modulesState.setSelectedDaySlug(moduleSlug, item.fields.slug);
      
      const params = this.modulesState.buildModuleQueryParams(moduleSlug, item.fields.slug);
      
      this.router.navigate([RoutePaths.Modules], {
        queryParams: this.helper.addAccessToQueryParams(params) ?? params
      });
    }
  }
}
