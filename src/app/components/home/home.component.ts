import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { SectionComponent } from '../contentful/section/section.component';
import { ExtendedContentfulService } from '../../services/contentful.service';
import { IHomePage } from '../contentful/models/contentful';
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
  readonly homePage = toSignal<IHomePage | null>(
    this.contentful.getEntryByKey<IHomePage>('homePage', 'home-page'),
    { initialValue: null }
  );
}
