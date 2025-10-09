import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { HelperService } from '../../../services/helper.service';
import { ISaveLaterBlockFields } from '../models/contentful';


@Component({
  selector: 'lilly-content-save-later-block',
  templateUrl: './save-later-block.component.html',
  styleUrls: ['./save-later-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MdToHtmlPipe]
})
export class SaveLaterBlockComponent {
  readonly saveLaterBlockFields = input.required<ISaveLaterBlockFields>();
  private readonly helperService = inject(HelperService);

  onDownload(): void {
    const fileUrl = this.saveLaterBlockFields()?.file?.fields?.file?.url;
    const fileName = this.saveLaterBlockFields()?.file?.fields?.file?.fileName;

    this.helperService.downloadFile(fileUrl, fileName);
  }
}


