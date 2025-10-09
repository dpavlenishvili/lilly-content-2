import {ChangeDetectionStrategy, Component, computed, HostBinding, inject, input} from '@angular/core';
import { IImageTileWidgetFields } from '../models/contentful';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import { AppMaterialModule } from 'src/app/shared-features/material/material.module';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import {
  ContainerWrapperComponent
} from '../../../shared-features/ui/components/section-wrapper/container-wrapper/container-wrapper.component';

@Component({
  selector: 'lilly-content-image-tile-widget',
  templateUrl: './image-tile-widget.component.html',
  styleUrls: ['./image-tile-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MdToHtmlPipe,
    AppMaterialModule,
    ContainerWrapperComponent,
    NgTemplateOutlet
  ],
  standalone: true
})
export class ImageTileWidgetComponent {
  wrapped = input<boolean>(true);
  hostClass = input<string>('widget--image-tile');
  readonly imageTileWidgetFields = input.required<IImageTileWidgetFields>();
  readonly isReverse = computed(() => this.imageTileWidgetFields()?.imagePosition === 'right');
  private readonly helperService = inject(HelperService);

  goToLink(): void {
    this.helperService.goToLink(this.imageTileWidgetFields()?.buttonLink, this.imageTileWidgetFields()?.linkBehavior as LinkBehavior);
  }

  @HostBinding('class')
  get hostClasses(): string {
    return `${this.hostClass() ? ' ' + this.hostClass() : ''}`;
  }
}
