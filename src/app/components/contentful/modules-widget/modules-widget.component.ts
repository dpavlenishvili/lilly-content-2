import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { IModule, IModulesNavigationBarFields } from '../models/contentful';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'lilly-content-modules-navigation-bar',
  templateUrl: './modules-widget.component.html',
  styleUrls: ['./modules-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OneRowNavigationComponent,
    ImageTileWidgetComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatButton
  ],
  standalone: true
})
export class ModulesNavigationBarComponent {
  readonly modulesNavigationBarFields = input<IModulesNavigationBarFields | undefined>();
  readonly fields = computed(() => this.modulesNavigationBarFields());
  readonly selectedMenuItem = signal<IModule | null>(null);

  constructor() {
    effect(() => {
      const fields = this.modulesNavigationBarFields();
      this.selectedMenuItem.set(fields?.menu?.[0] ?? null);
    }, { allowSignalWrites: true });
  }

  onMenuItemClick(item: IModule): void {
    this.selectedMenuItem.set(item);
  }
}
