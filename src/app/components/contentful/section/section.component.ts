import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';
import { AccordionWidgetComponent } from '../accordion-widget/accordion-widget.component';
import { ModulesNavigationBarComponent } from '../modules-navigation-bar/modules-navigation-bar.component';
import { TextWidgetComponent } from '../text-widget/text-widget.component';
import { ResourcesWidgetComponent } from '../resources-widget/resources-widget.component';
import {
  SectionWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/section-wrapper.component';
import { ISection } from '../models/contentful';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {
  ContainerWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/container-wrapper/container-wrapper.component';

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
    ResourcesWidgetComponent,
    SectionWrapperComponent,
    NgClass,
    ContainerWrapperComponent,
    NgTemplateOutlet
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
