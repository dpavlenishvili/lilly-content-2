import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ITrialConnectWidgetFields } from '../models/contentful';
import { GtmTriggerName } from '../../../enums/gtm-trigger-name';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DeepGtmTriggerDirective } from '@careboxhealth/layout1-shared';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import { SectionWrapperComponent } from 'src/app/shared-features/ui/components/section-wrapper/section-wrapper.component';

@Component({
  selector: 'lilly-trial-connect-widget',
  templateUrl: './trial-connect-widget.component.html',
  styleUrls: ['./trial-connect-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatButton,
    DeepGtmTriggerDirective,
    MdToHtmlPipe,
    SectionWrapperComponent
  ],
  standalone: true
})
export class TrialConnectWidgetComponent {
  @Input() trialConnectWidgetFields: ITrialConnectWidgetFields;

  readonly GtmTriggerName = GtmTriggerName;

  protected helperService = inject(HelperService);

  goToQuestionnaire(link: string, linkBehavior: LinkBehavior) {
    this.helperService.goToLink(link, linkBehavior);
  }

}
