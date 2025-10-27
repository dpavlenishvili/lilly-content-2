import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IModulesPage } from '../contentful/models/contentful';
import { ModulesNavigationBarComponent } from '../contentful/modules-navigation-bar/modules-navigation-bar.component';
import { SaveLaterBlockComponent } from '../contentful/save-later-block/save-later-block.component';
import {SectionWrapperModule} from '../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ModulesStateService } from '../../services/modules-state.service';
import { ModuleAccessService } from '../../services/module-access.service';
import { QueryParams } from '../../constants/query-params';

@Component({
  selector: 'lilly-content-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['modules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeroSectionComponent, ModulesNavigationBarComponent, SaveLaterBlockComponent, SectionWrapperModule]
})
export class ModulesComponent implements OnDestroy {
  private readonly contentful = inject(ExtendedContentfulService);
  private readonly route = inject(ActivatedRoute);
  private readonly modulesState = inject(ModulesStateService);
  private readonly moduleAccess = inject(ModuleAccessService);
  
  readonly modulesPage = toSignal<IModulesPage | null>(
    this.contentful.getEntryByKey<IModulesPage>('modulesPage', 'modules-page'),
    { initialValue: null }
  );

  readonly currentModuleSlug = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get(QueryParams.Module))),
    { initialValue: null }
  );

  readonly availableModules = computed(() => {
    const allModules = this.modulesPage()?.fields?.modulesNavigation?.fields?.menu || [];
    return this.moduleAccess.filterModules(allModules);
  });

  readonly filteredNavigationFields = computed(() => ({
    ...this.modulesPage()?.fields?.modulesNavigation?.fields,
    menu: this.availableModules()
  }));

  readonly selectedModule = computed(() => {
    const modules = this.availableModules();
    const moduleSlug = this.currentModuleSlug();
    return modules.find(m => m.fields?.slug === moduleSlug) || modules[0] || null;
  });

  private readonly syncSelectedModule = effect(() => {
    this.modulesState.setSelectedModule(this.selectedModule());
  }, { allowSignalWrites: true });

  ngOnDestroy(): void {
    this.modulesState.setSelectedModule(null);
  }
}


