import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IButton, IMicrostepsBlockFields } from '../models/contentful';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelperService } from '../../../services/helper.service';

@Component({
  selector: 'lilly-content-microsteps-block',
  standalone: true,
  imports: [MdToHtmlPipe, MatButtonModule, MatIconModule],
  templateUrl: './microsteps-block.component.html',
  styleUrls: ['./microsteps-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MicrostepsBlockComponent {
  readonly microstepsBlockFields = input<IMicrostepsBlockFields | undefined>();
  readonly fields = computed(() => this.microstepsBlockFields());
  private readonly helperService = inject(HelperService);

  onButtonClick(button: IButton | undefined): void {
    if (!button?.fields?.link) return;
    this.helperService.scrollToSection(button?.fields?.link?.substring(1));
  }
}
