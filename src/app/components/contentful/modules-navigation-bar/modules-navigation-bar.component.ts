import {ChangeDetectionStrategy, Component, computed, effect, HostBinding, Input, input, signal} from '@angular/core';
import { IModule, IModulesNavigationBarFields } from '../models/contentful';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import {
  WeekPlannerNavigationBarComponent
} from '../week-planner-navigation-bar/week-planner-navigation-bar.component';
import { VideoCarouselBlockComponent } from '../video-carousel-block/video-carousel-block.component';
import { ArticlesBlockComponent } from '../articles-block/articles-block.component';
import {
  ContainerWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/container-wrapper/container-wrapper.component';

@Component({
  selector: 'lilly-content-modules-navigation-bar',
  templateUrl: './modules-navigation-bar.component.html',
  styleUrls: ['./modules-navigation-bar.component.scss', '../../../../assets/styles/_v3/modules/nav-tabs.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OneRowNavigationComponent,
    ImageTileWidgetComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatButton,
    WeekPlannerNavigationBarComponent,
    VideoCarouselBlockComponent,
    ArticlesBlockComponent,
    ContainerWrapperComponent
  ],
  standalone: true
})
export class ModulesNavigationBarComponent {
  readonly modulesNavigationBarFields = input<IModulesNavigationBarFields | undefined>();
  readonly fields = computed(() => this.modulesNavigationBarFields());
  readonly selectedMenuItem = signal<IModule | null>(null);
  @Input() hostClass: string = 'widget--navbar';
  constructor() {
    effect(() => {
      const fields = this.modulesNavigationBarFields();
      this.selectedMenuItem.set(fields?.menu?.[0] ?? null);
    }, { allowSignalWrites: true });
  }

  onMenuItemClick(item: IModule): void {
    this.selectedMenuItem.set(item);
  }
  @HostBinding('class')
  get hostClasses(): string {
    return `${this.hostClass ? ' ' + this.hostClass : ''}`;
  }
}
