import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { IQuizWidgetQuestionFields } from '../../models/contentful';
import {DOCUMENT, NgClass, NgStyle} from '@angular/common';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MdToHtmlPipe } from '../../../../pipes/md-to-html.pipe';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'lilly-quiz-widget-question',
  templateUrl: './quiz-widget-question.component.html',
  styleUrls: ['./quiz-widget-question.component.scss'],
  imports: [
    MatRadioGroup,
    FormsModule,
    MatRadioButton,
    NgStyle,
    MdToHtmlPipe,
    NgClass,
    MatIcon
  ],
  standalone: true
})
export class QuizWidgetQuestionComponent {
  question: IQuizWidgetQuestionFields;
  QUIZ_QUESTION = 'quiz-question';
  @Input() set currentQuestion(value: IQuizWidgetQuestionFields) {
    this.question = value;
    this.document.getElementById(this.QUIZ_QUESTION)?.focus();
  }
  @Input() value: string;
  @Output() valueSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(@Inject(DOCUMENT) protected document: Document) {
  }

  onSelect(): void {
    this.valueSelected.emit(this.value);
  }
}
