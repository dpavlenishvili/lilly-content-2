import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IResourceFields } from '../../models/contentful';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';
import { AnalyticsService } from '@careboxhealth/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { HelperService } from '../../../../services/helper.service';

@Component({
  selector: 'lilly-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatButton,
    MdToHtmlPipe
  ],
  standalone: true
})
export class ResourceComponent {
  @Input() resourceFields: IResourceFields;
  @Input() trialId: number;

  constructor(
    private analytics: AnalyticsService,
    private helperService: HelperService
  ) { }

  onLinkClick(): void {
    const { url, linkBehavior } = this.resourceFields?.link?.fields || {};
    this.helperService.goToLink(url, linkBehavior);
    this.sendAnalytics();
  }

  sendAnalytics(): void {
    const entries = {
      action: 'TrialResourceViewed',
      trialId: this.trialId,
      Resource: this.resourceFields?.heading
    };
    this.analytics.write(entries);
  }
}
