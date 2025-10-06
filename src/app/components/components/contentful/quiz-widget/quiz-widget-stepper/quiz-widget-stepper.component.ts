import {Component, Inject, Input, OnInit} from '@angular/core';
import { IQuizWidgetFields } from '../../models/contentful';
import { ICmsAnalytics } from '../../models/cmsanalytics';
import { HelperService } from 'src/app/services/helper.service';
import {DOCUMENT, NgClass, NgTemplateOutlet} from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { QuizWidgetQuestionComponent } from '../quiz-widget-question/quiz-widget-question.component';
import {MatButtonModule} from '@angular/material/button';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';
import {SectionWrapperModule} from '../../../../shared-features/ui/components/section-wrapper/section-wrapper.module';


@Component({
  selector: 'lilly-quiz-widget-stepper',
  templateUrl: './quiz-widget-stepper.component.html',
  styleUrls: [
    '../../../../../assets/styles/_v3/modules/questionnaire/quiz-layout.scss',
      './quiz-widget-stepper.component.scss'
  ],
  imports: [
    NgClass,
    MatIcon,
    QuizWidgetQuestionComponent,
    MatButtonModule,
    MdToHtmlPipe,
    SectionWrapperModule,
    NgTemplateOutlet
  ],
  standalone: true
})
export class QuizWidgetStepperComponent implements OnInit {
  @Input() widgetFields: IQuizWidgetFields;
  @Input() cmsAnalytics: ICmsAnalytics;
  readonly animationTime: number = 500;
  readonly threeStepperMinNumber: number = 3;
  quizLength = 0;
  nextQuizNumber = 2;
  currentQuizNumber = 1;
  nextQuizAnimation = false;
  previousQuizAnimation = false;
  backButtonEnabled = false;
  completedQuiz = false;
  answers: {[key: number]: string} = {};
  QUIZ_COMPLETED_MESSAGE= 'quiz-completed-message';

  constructor(
      private helperService: HelperService,
      @Inject(DOCUMENT) protected document: Document
  ) { }

  ngOnInit(): void {
    this.quizLength = this.widgetFields?.questions?.length || 0;
  }

  onAnswerQuestion(value: string): void {
    this.answers[this.currentQuizNumber] = value;
  }

  onReset(): void {
    this.answers = {};
    this.currentQuizNumber = 1;
    this.nextQuizNumber = 2;
    this.completedQuiz = false;
  }

  goForward(): void {

    this.sendCmsAnalytics();

    if (this.currentQuizNumber < this.quizLength) {
      this.currentQuizNumber++;

      const secondQuiz = 2;
      if (this.currentQuizNumber === secondQuiz) {
        this.backButtonEnabled = true;
        return;
      }
      // for animation
      this.nextQuizAnimation = true;
      setTimeout(() => {
        this.nextQuizAnimation = false;
        this.nextQuizNumber++;
      }, this.animationTime);
    } else {
      this.completedQuiz = true;
      this.backButtonEnabled = false;
      setTimeout(() => {
        this.document.getElementById(this.QUIZ_COMPLETED_MESSAGE)?.focus();
      }, this.animationTime);
    }
  }

  goBack(): void {
    const firstQuiz = 1;

    if (this.currentQuizNumber > firstQuiz) {
      this.currentQuizNumber--;

      if (this.currentQuizNumber === firstQuiz) {
        this.backButtonEnabled = false;
        this.nextQuizNumber = this.currentQuizNumber + 1;
        return;
      }
      // for animation
      this.previousQuizAnimation = true;
      this.nextQuizNumber--;
      setTimeout(() => {
        this.previousQuizAnimation = false;
      }, this.animationTime);
    }
  }

  private sendCmsAnalytics(): void {
    const answer = this.widgetFields?.questions[this.currentQuizNumber - 1]?.fields.answers.filter(ans => {
      return ans.sys.id == this.answers[this.currentQuizNumber];
    })[0]?.fields.answer;

    const isCorrectAnswer = this.widgetFields?.questions[this.currentQuizNumber - 1]?.fields?.correctAnswer.sys.id === this.answers[this.currentQuizNumber];

    const analytics = {
      ...this.cmsAnalytics,
      question: this.widgetFields?.questions[this.currentQuizNumber - 1]?.fields.question,
      answer,
      isCorrectAnswer,
    };

    this.helperService.sendAnalytics(analytics, 'TestYourKnowledgeContinue');
  }

}
