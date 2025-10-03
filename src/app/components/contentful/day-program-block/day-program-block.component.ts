import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { IIcon } from '../models/contentful';
import { PrintService } from '@careboxhealth/core';
import { HelperService } from '../../../services/helper.service';
import { LinkTarget } from '@careboxhealth/layout1-shared';
import { IDayProgramFields } from '../models/contentful';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-content-day-program-block',
  standalone: true,
  imports: [MdToHtmlPipe],
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
    switch (icon?.fields?.type) {
    case 'print':
      (this.printService?.printPage?.bind(this.printService) ?? window.print.bind(window))();
      break;

    case 'mail': {
      // Opens a blank mail compose. Content (subject/body/attachments) is undefined for now.
      const mailto = 'mailto:';
      this.helperService.openDialog(mailto, LinkTarget.Self);
      break;
    }
    }
  }
}
