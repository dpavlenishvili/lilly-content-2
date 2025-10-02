import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';
import { AccordionWidgetComponent } from '../accordion-widget/accordion-widget.component';
import { ModulesNavigationBarComponent } from '../modules-widget/modules-widget.component';
import { TextWidgetComponent } from '../text-widget/text-widget.component';
import { SectionWrapperComponent } from '../../../shared-features/ui/components/section-wrapper/section-wrapper.component';
import { ISection } from '../models/contentful';

@Component({
  selector: 'lilly-content-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImageTileWidgetComponent,
    AccordionWidgetComponent,
    ModulesNavigationBarComponent,
    TextWidgetComponent,
    SectionWrapperComponent
  ],
  standalone: true
})
export class SectionComponent {
  readonly section = input.required<ISection>();

  readonly showTitle = computed(() => {
    const section = this.section();
    return !!section?.fields?.title && !section?.fields?.hideTitle;
  });
}
