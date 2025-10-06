import { Component, Input } from '@angular/core';
import { AnalyticsService } from '@careboxhealth/core';
import { UiLayoutGridService } from '@careboxhealth/layout1-shared';
import { ITabContentFields } from '../../models/contentful';
import { HelperService } from '../../../../services/helper.service';
import { CmsEntryId } from '../../../../enums/cms-entry-id';
import { GtmTriggerName } from '../../../../enums/gtm-trigger-name';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';

const CMS_GTM_MAPPER = {
  [CmsEntryId.TabTrialMatch]: GtmTriggerName.QuestionnaireEnter
};

@Component({
  selector: 'lilly-tab-content',
  templateUrl: './tab-content.component.html',
  styleUrls: ['./tab-content.component.scss'],
  imports: [
    NgTemplateOutlet,
    NgIf,
    MatButton,
    MdToHtmlPipe
  ],
  standalone: true
})
export class TabContentComponent {
  @Input() tabContentFields: ITabContentFields;
  @Input() entryId: string;

  get gtmEventName(): string {
    return CMS_GTM_MAPPER[this.entryId] || '';
  }

  constructor(
    public uiGridService: UiLayoutGridService,
    public helperService: HelperService,
    protected analytics: AnalyticsService
  ) {}

  forAnalytics(): void {
    if (this.entryId === CmsEntryId.TabTrialMatch) {
      const entries = {
        action: 'MatchingIntro',
        referrer: 'Homepage Carousel'
      };
      this.analytics.write(entries);
    }
    this.helperService.goToLink(this.tabContentFields?.url, this.tabContentFields?.linkBehavior);
  }
}
