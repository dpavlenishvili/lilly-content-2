import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IImageTileWidgetFields } from '../models/contentful';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { NgClass } from '@angular/common';
import { AppMaterialModule } from 'src/app/shared-features/material/material.module';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';

@Component({
  selector: 'lilly-content-image-tile-widget',
  templateUrl: './image-tile-widget.component.html',
  styleUrls: ['./image-tile-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MdToHtmlPipe,
    AppMaterialModule
  ],
  standalone: true
})
export class ImageTileWidgetComponent {
  readonly imageTileWidgetFields = input.required<IImageTileWidgetFields>();
  readonly isReverse = computed(() => this.imageTileWidgetFields()?.imagePosition === 'right');
  private readonly helperService = inject(HelperService);

  goToLink(): void {
    this.helperService.goToLink(this.imageTileWidgetFields()?.buttonLink, this.imageTileWidgetFields()?.linkBehavior as LinkBehavior);
  }
}
