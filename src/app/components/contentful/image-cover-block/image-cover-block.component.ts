import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IImageCoverBlockFields } from '../models/contentful';
import { AppMaterialModule } from '../../../shared-features/material/material.module';
import {CbCardModule} from '../../../shared-features/ui/components/cb-card/src/app/shared/card';
import {SectionWrapperModule} from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';

@Component({
  selector: 'lilly-content-image-cover-block',
  templateUrl: './image-cover-block.component.html',
  styleUrls: ['./image-cover-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppMaterialModule,
    SectionWrapperModule,
    CbCardModule
  ],
  standalone: true
})
export class ImageCoverBlockComponent {
  readonly imageCoverBlockFields = input<IImageCoverBlockFields | undefined>();
}
