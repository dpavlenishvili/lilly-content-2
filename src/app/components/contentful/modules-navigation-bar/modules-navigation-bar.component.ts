import {ChangeDetectionStrategy, Component, computed, effect, HostBinding, inject,  input, signal} from '@angular/core';
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

import {SectionWrapperModule} from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import {NgTemplateOutlet} from '@angular/common';
import { Router } from '@angular/router';
import { ModulesStateService } from '../../../services/modules-state.service';
import { RoutePaths } from '../../../constants/routes';
import { HelperService } from 'src/app/services/helper.service';

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
    ContainerWrapperComponent,
    SectionWrapperModule,
    NgTemplateOutlet
  ],
  standalone: true
})
export class ModulesNavigationBarComponent {
  private readonly router = inject(Router);  
  private readonly modulesState = inject(ModulesStateService);
  private readonly helper = inject(HelperService);
  
  readonly modulesNavigationBarFields = input<IModulesNavigationBarFields | undefined>();
  readonly fields = computed(() => this.modulesNavigationBarFields());
  readonly selectedMenuItem = signal<IModule | null>(null);
  wrapped = input<boolean>(true);
  hostClass = input<string>('widget--navbar');

  constructor() {
    effect(() => {
      const fields = this.modulesNavigationBarFields();
      const selectedModule = this.modulesState.selectedModule();
      const menuItem = selectedModule || fields?.menu?.[0] || null;
      this.selectedMenuItem.set(menuItem);
    }, { allowSignalWrites: true });
  }

  onMenuItemClick(item: IModule): void {
    this.selectedMenuItem.set(item);
    this.modulesState.setSelectedModule(item);
    const moduleSlug = item?.fields?.slug;
    if (!moduleSlug) {
      return;
    }
    const currentUrl = this.router.url;
    const isModulesPage = currentUrl.startsWith(RoutePaths.Modules);
    
    if (!isModulesPage) {
      return;
    }
    
    const selectedDay = this.modulesState.getSelectedDaySlug(moduleSlug);
    const params = this.modulesState.buildModuleQueryParams(moduleSlug, selectedDay);
    
    this.router.navigate([RoutePaths.Modules], {
      queryParams: this.helper.addAccessToQueryParams(params) ?? params
    });
  }
  
  @HostBinding('class')
  get hostClasses(): string {
    return `${this.hostClass() ? ' ' + this.hostClass() : ''}`;
  }
}
