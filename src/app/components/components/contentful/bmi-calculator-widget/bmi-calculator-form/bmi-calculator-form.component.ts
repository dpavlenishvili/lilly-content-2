import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {UntypedFormGroup, NgForm, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { IBmiCalculatorWidgetFields } from '../../models/contentful';
import { Unit } from '../bmi-calculator-widget.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'lilly-bmi-calculator-form',
  templateUrl: './bmi-calculator-form.component.html',
  styleUrls: ['./bmi-calculator-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatIcon,
    NgClass,
    MatFormField,
    MatInput,
    MatHint,
    MatButton,
    MatLabel
  ],
  standalone: true
})
export class BmiCalculatorFormComponent {
  @ViewChild('ngForm', { static: false }) ngForm: NgForm;
  @ViewChild('numberOnly') numberOnly: ElementRef;
  @ViewChild('heightPrefix_imperial') heightPrefix_imperial: ElementRef;
  @ViewChild('heightSuffix_imperial') heightSuffix_imperial: ElementRef;
  @ViewChild('heightPrefix_metric') heightPrefix_metric: ElementRef;
  @ViewChild('weight_metric') weight_metric: ElementRef;
  @ViewChild('weight_imperial') weight_imperial: ElementRef;
  @Input() fields: IBmiCalculatorWidgetFields;
  @Input() form: UntypedFormGroup;
  @Output() formSubmitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() unitChanged: EventEmitter<Unit> = new EventEmitter<Unit>();

  errors: ElementRef[] = [];
  hideErrors: { [key: string]: boolean } = {};

  Unit = Unit;

  get formValues() { return this.form.value; }
  get formControls() { return this.form?.controls; }

  unitChange(event: MatRadioChange): void {
    this.errors = [];
    this.unitChanged.emit(event.value);
    this.ngForm.onReset();
  }

  onSubmit(): void {
    // handle form errors
    this.hideErrors = {};
    this.errors = [];
    let hasNumbersOnlyValidation: boolean = false;
    Object.keys(this.formControls).forEach(key => {
      const fieldErrors: ValidationErrors | null = this.formControls[key]?.errors;
      if (!fieldErrors) return;
      Object.keys(fieldErrors).forEach(errKey => {
        switch (errKey) {
        case 'min':
        case 'max':
          this.errors.push(this[key + '_' + this.formValues.unit].nativeElement.innerHTML);
          break;

        case 'pattern':
          // to prevent repeating of numbers only validation
          if (hasNumbersOnlyValidation) return;
          this.errors.unshift(this.numberOnly.nativeElement.innerHTML);
          hasNumbersOnlyValidation = true;
          break;
        }
      });
    });

    if (!this.form.valid) return;
    this.formSubmitted.emit(true);
  }

  setFocus(event: Event, type: string): void {
    if (this.formControls[type].errors && event instanceof MouseEvent){
      this.hideErrors[type] = true;
    }
  }

  getHeightPlaceholder(formValues: string): string {
    return formValues === Unit.IMPERIAL ? $localize`:@@bmi_calculator.feet:Feet` : $localize`:@@bmi_calculator.centimeters:Centimeters`;
  }
  getWeightPlaceholder(formValues: string): string {
    return formValues === Unit.IMPERIAL ? $localize`:@@bmi_calculator.pounds:Pounds` : $localize`:@@bmi_calculator.kilograms:Kilograms`;
  }
}
