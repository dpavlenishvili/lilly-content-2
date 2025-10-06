import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IQuestionnaireWidgetFields } from '../models/contentful';
import { Router } from '@angular/router';
import { AppTrialSummaryClientRoutes } from '@careboxhealth/layout1-trial-summary';
import { HelperService } from 'src/app/services/helper.service';
import { ICmsAnalytics } from '../models/cmsanalytics';
import { MatIcon } from '@angular/material/icon';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { CbCardBodyDirective, CbCardComponent } from '../../../shared-features/ui/components/cb-card/src/app/shared/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lilly-questionnaire-widget',
  templateUrl: './questionnaire-widget.component.html',
  styleUrls: ['./questionnaire-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MdToHtmlPipe,
    CbCardComponent,
    CbCardBodyDirective,
    MatButtonModule,
  ],
  standalone: true
})
export class QuestionnaireWidgetComponent {
  @Input() questionnaireWidgetFields: IQuestionnaireWidgetFields;
  @Input() cmsAnalytics: ICmsAnalytics;


  constructor(private router: Router, private helperService: HelperService) { }

  navigateToQuestionnaire(): void {
    const commands = [AppTrialSummaryClientRoutes.QuestionnaireIntro];
    const { diseaseID, subDiseaseID , subsiteName } = this.cmsAnalytics || {};
    if (diseaseID?.length === 1) {
      commands.push(diseaseID[0]);
    }
    if (diseaseID?.length === 1 && subDiseaseID?.length === 1) {
      commands.push(subDiseaseID[0]);
    }

    const analyticsPayload = { ...this.cmsAnalytics, subDiseaseID, subsiteName, diseaseID: this.helperService.getDiseaseIdsForAnalytics(diseaseID) };
    this.helperService.sendAnalytics(analyticsPayload, this.helperService.getActionNameByPageType(this.cmsAnalytics?.pageType, 'MatchingBannerClick'));

    void this.router.navigate(commands);
  }
}
