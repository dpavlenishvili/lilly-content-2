import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { SectionComponent } from '../contentful/section/section.component';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { IHomePage } from '../contentful/models/contentful';
import { PageContextService } from '../../services/page-context.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lilly-content-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeroSectionComponent, SectionComponent]
})
export class HomeComponent {
  private readonly contentful = inject(ExtendedContentfulService);
  private readonly pageContext = inject(PageContextService);
  readonly homePage = toSignal<IHomePage | null>(
    this.contentful.getEntryByKey<IHomePage>('homePage', 'home-page'),
    { initialValue: null }
  );

  // Keep pageName in sync for header
  /* eslint-disable @typescript-eslint/no-unused-expressions */
  private readonly syncPageName = effect(() => {
    const page = this.homePage();
    this.pageContext.setPageName(page?.fields?.pageName);
  }, { allowSignalWrites: true });
}
