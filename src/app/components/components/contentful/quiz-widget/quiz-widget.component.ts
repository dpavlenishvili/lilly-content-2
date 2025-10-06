import { Component, Input, ViewChild} from '@angular/core';
import { IQuizWidgetFields } from '../models/contentful';
import { HelperService } from 'src/app/services/helper.service';
import { ICmsAnalytics } from '../models/cmsanalytics';
import { QuizWidgetStartComponent } from './quiz-widget-start/quiz-widget-start.component';
import { QuizWidgetStepperComponent } from './quiz-widget-stepper/quiz-widget-stepper.component';
import { OverlayComponent } from '../../../shared-features/ui/overlay/overlay.component';


@Component({
  selector: 'lilly-quiz-widget',
  templateUrl: './quiz-widget.component.html',
  styleUrls: ['./quiz-widget.component.scss'],
  imports: [
    QuizWidgetStartComponent,
    QuizWidgetStepperComponent,
    OverlayComponent
  ],
  standalone: true
})
export class QuizWidgetComponent  {
  @Input() widgetFields: IQuizWidgetFields;
  @Input() set cmsAnalytics(analytics: ICmsAnalytics) {
    this._analytics = { subsiteName: analytics.subsiteName };
  }
  _analytics: any;

  get analytics() {
    return this._analytics;
  }

  @ViewChild('overlayComponent') overlayComponent!: OverlayComponent;

  constructor(private helperService: HelperService){}



  onStartQuiz(): void {
    this.helperService.overlay = this.overlayComponent;
    this.helperService.sendAnalytics(this.analytics, 'TestYourKnowledgeStart');
    this.helperService.overlay.openOverlay();
  }
}
