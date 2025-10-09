import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IModulesPage } from '../contentful/models/contentful';
import { PageContextService } from '../../services/page-context.service';
import { ModulesNavigationBarComponent } from '../contentful/modules-navigation-bar/modules-navigation-bar.component';
import { SaveLaterBlockComponent } from '../contentful/save-later-block/save-later-block.component';

@Component({
  selector: 'lilly-content-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['modules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeroSectionComponent, ModulesNavigationBarComponent, SaveLaterBlockComponent]
})
export class ModulesComponent {
  private readonly contentful = inject(ExtendedContentfulService);
  private readonly pageContext = inject(PageContextService);
  readonly modulesPage = toSignal<IModulesPage | null>(
    this.contentful.getEntryByKey<IModulesPage>('modulesPage', 'modules-page'),
    { initialValue: null }
  );

  // Keep pageName in sync for header
  /* eslint-disable @typescript-eslint/no-unused-expressions */
  private readonly syncPageName = effect(() => {
    const page = this.modulesPage();
    this.pageContext.setPageName(page?.fields?.pageName);
  }, { allowSignalWrites: true });
}


