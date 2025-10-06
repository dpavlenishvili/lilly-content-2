import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { IFindTrialWidgetFields } from '../models/contentful';
import { GtmTriggerName } from '../../../enums/gtm-trigger-name';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DeepGtmTriggerDirective } from '@careboxhealth/layout1-shared';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { CbCardBodyDirective, CbCardComponent } from '../../../shared-features/ui/components/cb-card/src/app/shared/card';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';

@Component({
  selector: 'lilly-find-trial-widget',
  templateUrl: './find-trial-widget.component.html',
  styleUrls: ['./find-trial-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatButton,
    DeepGtmTriggerDirective,
    MdToHtmlPipe,
    CbCardComponent,
    CbCardBodyDirective
  ],
  standalone: true
})
export class FindTrialWidgetComponent {
  @Input() findTrialWidgetFields: IFindTrialWidgetFields;

  readonly GtmTriggerName = GtmTriggerName;

  protected helperService = inject(HelperService);

  goToTrialsPage(link: string, linkBehavior: LinkBehavior) {
    this.helperService.goToLink(link, linkBehavior);
  }

}
