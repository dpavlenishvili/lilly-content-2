import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IDayProgramFields, IIcon } from '../models/contentful';
import { PrintService } from '@careboxhealth/core';
import { HelperService } from '../../../services/helper.service';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { MicrostepsBlockComponent } from '../microsteps-block/microsteps-block.component';
import { ImageCoverBlockComponent } from '../image-cover-block/image-cover-block.component';
import { BenefitsBlockComponent } from '../benefits-block/benefits-block.component';

@Component({
  selector: 'lilly-content-day-program-block',
  standalone: true,
  imports: [MdToHtmlPipe, MicrostepsBlockComponent, ImageCoverBlockComponent, BenefitsBlockComponent],
  templateUrl: './day-program-block.component.html',
  styleUrls: ['./day-program-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayProgramBlockComponent {
  readonly dayProgramBlockFields = input<IDayProgramFields | undefined>();
  readonly fields = computed(() => this.dayProgramBlockFields());
  private readonly printService = inject(PrintService);
  private readonly helperService = inject(HelperService);

  onActionClick(icon: IIcon): void {
    const fileUrl = this.fields()?.file?.fields?.file?.url;
    
    switch (icon?.fields?.type) {
    case 'print':
      if (fileUrl) {
        this.helperService.printFile(fileUrl);
      } else {
        (this.printService?.printPage?.bind(this.printService) ?? window.print.bind(window))();
      }
      break;

    case 'mail':
      if (fileUrl) {
        this.helperService.sendEmailWithFile(fileUrl, this.fields()?.heading ?? '');
      }
      break;
    }
  }
}
