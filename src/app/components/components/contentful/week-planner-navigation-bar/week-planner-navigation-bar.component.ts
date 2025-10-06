import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { IDayProgram, IWeekPlannerNavigationFields } from '../models/contentful';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { DayProgramBlockComponent } from '../day-program-block/day-program-block.component';

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
    DayProgramBlockComponent
  ],
  standalone: true
})
export class WeekPlannerNavigationBarComponent {
  readonly weekPlannerNavigationBarFields = input<IWeekPlannerNavigationFields | undefined>();
  readonly fields = computed(() => this.weekPlannerNavigationBarFields());
  readonly selectedMenuItem = signal<IDayProgram | null>(null);

  constructor() {
    effect(() => {
      const fields = this.weekPlannerNavigationBarFields();
      this.selectedMenuItem.set(fields?.days?.[0] ?? null);
    }, { allowSignalWrites: true });
  }

  onMenuItemClick(item: IDayProgram): void {
    this.selectedMenuItem.set(item);
  }
}
