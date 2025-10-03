import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IBenefitsBlockFields } from '../models/contentful';
import { AppMaterialModule } from '../../../shared-features/material/material.module';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-content-benefits-block',
  templateUrl: './benefits-block.component.html',
  styleUrls: ['./benefits-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppMaterialModule,
    MdToHtmlPipe
  ],
  standalone: true
})
export class BenefitsBlockComponent {
  readonly benefitsBlockFields = input<IBenefitsBlockFields | undefined>();

  onButtonClick(): void {
    // TODO: Implement file download requirement is not clear yet
  }
}

