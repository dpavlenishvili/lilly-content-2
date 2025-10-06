import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IQuizStartWidgetFields} from '../../models/contentful';
import {MatButtonModule} from '@angular/material/button';
import {MdToHtmlPipe} from '../../../../pipes/md-to-html.pipe';
import {CbCardModule} from '../../../../shared-features/ui/components/cb-card/src/app/shared/card';
import {MatIcon} from '@angular/material/icon';


@Component({
    selector: 'lilly-quiz-widget-start',
    templateUrl: './quiz-widget-start.component.html',
    styleUrls: ['./quiz-widget-start.component.scss'],
    imports: [
        MatButtonModule,
        MdToHtmlPipe,
        CbCardModule,
        MatIcon
    ],
    standalone: true
})
export class QuizWidgetStartComponent {
    @Input() fields: IQuizStartWidgetFields;
    @Output() buttonClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
}
