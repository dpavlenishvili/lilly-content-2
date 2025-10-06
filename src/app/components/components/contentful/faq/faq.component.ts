import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaContentComponent } from '../media-content/media-content/media-content.component';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeroWrapperComponent } from '../../../shared-features/ui/hero-wrapper/hero-wrapper.component';
import { PageType } from '../../blog/enums/page-type.enum';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { SectionComponent } from '../section/section.component';
import { PageComponent } from '../page/page.component';
import { SectionWrapperComponent } from '../../../shared-features/ui/components/section-wrapper/section-wrapper.component';


@Component({
  selector: 'lilly-faq-page',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MediaContentComponent,
    MdToHtmlPipe,
    BreadcrumbComponent,
    HeroWrapperComponent,
    HeroSectionComponent,
    SectionComponent,
    RouterLink,
    SectionWrapperComponent
  ],
  standalone: true
})
export class FAQComponent extends PageComponent {
  readonly PageType = PageType;
}
