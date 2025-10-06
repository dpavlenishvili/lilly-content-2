import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBmiCalculatorWidgetFields, IBmiResultStatus } from '../../models/contentful';
import { NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'lilly-bmi-result-table',
  templateUrl: './bmi-result-table.component.html',
  styleUrls: ['./bmi-result-table.component.scss'],
  imports: [
    NgClass,
    NgForOf,
    NgStyle,
    NgIf,
    MatButton,
    MatIcon
  ],
  standalone: true
})
export class BmiResultTableComponent {
  @Input() fields: IBmiCalculatorWidgetFields;
  @Input() selectedBMI: IBmiResultStatus;
  @Input() bmi: number;
  @Input() selectedRangePerc: number;
  @Output() goBack: EventEmitter<boolean> = new EventEmitter<boolean>();

}
