import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { IButton, IHeroSectionFields } from '../models/contentful';
import { AppMaterialModule } from '../../../shared-features/material/material.module';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'lilly-content-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppMaterialModule,
    MdToHtmlPipe
  ],
  standalone: true
})
export class HeroSectionComponent {
  @Input() heroFields?: IHeroSectionFields;

  private readonly helperService: HelperService = inject(HelperService);

  goToLink(btn: IButton): void {
    this.helperService.goToLink(btn?.fields?.link, btn?.fields?.linkBehavior);
  }
}
