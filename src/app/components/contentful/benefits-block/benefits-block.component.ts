import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IBenefitsBlockFields } from '../models/contentful';
import { AppMaterialModule } from '../../../shared-features/material/material.module';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { HelperService } from 'src/app/services/helper.service';

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
  readonly benefitsBlockFields = input.required<IBenefitsBlockFields>();
  private readonly helperService = inject(HelperService); 
  
  onDownload (): void {
    const fileUrl = this.benefitsBlockFields()?.file?.fields?.file?.url;
    const fileName = this.benefitsBlockFields()?.file?.fields?.file?.fileName;
    
    this.helperService.downloadFile(fileUrl, fileName);
  }
}

