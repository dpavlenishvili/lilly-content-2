import { ChangeDetectionStrategy, Component, inject, input, Input } from '@angular/core';
import { IButton, IHeroSectionFields } from '../models/contentful';
import { AppMaterialModule } from '../../../shared-features/material/material.module';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { HelperService } from 'src/app/services/helper.service';
import {HeroWrapperComponent} from '../../../shared-features/ui/components/hero-wrapper/hero-wrapper.component';

@Component({
  selector: 'lilly-content-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppMaterialModule,
    MdToHtmlPipe,
    HeroWrapperComponent
  ],
  standalone: true
})
export class HeroSectionComponent {
  @Input() scrollID: string;
  readonly heroFields = input<IHeroSectionFields>();

  private readonly helperService: HelperService = inject(HelperService);

  goToLink(btn: IButton): void {
    this.helperService.goToLink(btn?.fields?.link, btn?.fields?.linkBehavior);
  }

  scrollToId(): void {
    if (!this.scrollID) return;
    const el = document.getElementById(this.scrollID);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
