import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IModulesPage } from '../contentful/models/contentful';
import { ModulesNavigationBarComponent } from '../contentful/modules-navigation-bar/modules-navigation-bar.component';

@Component({
  selector: 'lilly-content-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['modules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeroSectionComponent, ModulesNavigationBarComponent]
})
export class ModulesComponent {
  private readonly contentful = inject(ExtendedContentfulService);
  readonly modulesPage = toSignal<IModulesPage | null>(
    this.contentful.getEntryByKey<IModulesPage>('modulesPage', 'modules-page'),
    { initialValue: null }
  );
}


