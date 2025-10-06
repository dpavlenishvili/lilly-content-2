import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators} from '@angular/forms';
import { IBmiCalculatorWidgetFields, IBmiResultStatus } from '../models/contentful';
import { HelperService } from 'src/app/services/helper.service';
import { ICmsAnalytics } from '../models/cmsanalytics';
import { MatCard, MatCardContent } from '@angular/material/card';
import { BmiCalculatorFormComponent } from './bmi-calculator-form/bmi-calculator-form.component';
import { BmiResultTableComponent } from './bmi-result-table/bmi-result-table.component';
import { NgClass } from '@angular/common';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import {CbCardModule} from '../../../shared-features/ui/components/cb-card/src/app/shared/card';

type ActiveViewType = View.CALCULATOR | View.RESULT;

enum View {
  CALCULATOR = 'calculator',
  RESULT = 'result'
}

export enum Unit {
  IMPERIAL = 'imperial',
  METRIC = 'metric'
}

@Component({
  selector: 'lilly-bmi-calculator-widget',
  templateUrl: './bmi-calculator-widget.component.html',
  styleUrls: ['./bmi-calculator-widget.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    BmiCalculatorFormComponent,
    BmiResultTableComponent,
    NgClass,
    MdToHtmlPipe,
      CbCardModule
  ],
  standalone: true
})
export class BmiCalculatorWidgetComponent implements OnInit {
  @Input() bmiWidgetFields: IBmiCalculatorWidgetFields;
  @Input() set cmsAnalytics(analytics: ICmsAnalytics) {
    this._cmsAnalytics = analytics;
  }

  _cmsAnalytics: ICmsAnalytics;

  get cmsAnalytics() {
    return this._cmsAnalytics;
  }
  readonly convertingCoefficient: number = 703;
  calculatorForm: UntypedFormGroup;
  activeView: ActiveViewType = View.CALCULATOR;
  bmi: number;
  selectedRangePerc: number | null = null;
  selectedBMI: IBmiResultStatus | null = null;

  View = View;

  constructor(protected fb: UntypedFormBuilder, private helperService: HelperService, public elementRef: ElementRef) { }

  ngOnInit(): void {
    this.buildForm(this.bmiWidgetFields?.defaultUnit || Unit.IMPERIAL);
    this.cmsAnalytics = {
      ...this.cmsAnalytics,
      diseaseID: this.helperService.getDiseaseIdsForAnalytics(this.cmsAnalytics.diseaseID)
    };
  }

  buildForm(unit: string): void {
    const validators: { [key: string]: {[key: string]: ValidatorFn[]} } = {
      weight: {
        [Unit.IMPERIAL]: [Validators.min(1), Validators.max(330)],
        [Unit.METRIC]: [Validators.min(1), Validators.max(150)],
      },
      heightPrefix: {
        [Unit.IMPERIAL]: [Validators.min(1), Validators.max(15)],
        [Unit.METRIC]: [Validators.min(1), Validators.max(457)],
      }
    };
    this.calculatorForm = this.fb.group({
      weight: [null, [Validators.required, Validators.pattern('^[0-9]*$'), ...validators.weight[unit]]],
      heightPrefix: [null, [Validators.required, Validators.pattern('^[0-9]*$'), ...validators.heightPrefix[unit]]],
      heightSuffix: [null, [Validators.pattern('^[0-9]*$'), Validators.min(0), Validators.max(12)]],
      unit: [unit, [Validators.required]]
    });
  }

  onGoCalculator(): void {
    this.buildForm(this.calculatorForm.value.unit);
    this.activeView = View.CALCULATOR;

    const values = this.calculatorForm.value;
    const height: number = +values.heightPrefix;
    const heightSuffix: number = +values.heightSuffix || 0;
    const weight: number = +values.weight;

    const analytics = {
      ...this.cmsAnalytics,
      calculationType: values.unit,
      height,
      heightSuffix,
      weight,
      diseaseID: this.helperService.getDiseaseIdsForAnalytics(this.cmsAnalytics.diseaseID)
    };
    this.helperService.sendAnalytics(analytics, this.helperService.getActionNameByPageType(this.cmsAnalytics.pageType, 'BMIRecalculate'));
  }

  onCalculate(): void {
    this.selectedBMI = null;
    this.selectedRangePerc = null;
    const values = this.calculatorForm.value;
    const height: number = +values.heightPrefix;
    const heightSuffix: number = +values.heightSuffix || 0;
    const weight: number = +values.weight;

    const analytics = {
      ...this.cmsAnalytics,
      calculationType: values?.unit,
      height,
      heightSuffix,
      weight,
      diseaseID: this.helperService.getDiseaseIdsForAnalytics(this.cmsAnalytics.diseaseID)
    };
    this.helperService.sendAnalytics(analytics, this.helperService.getActionNameByPageType(this.cmsAnalytics.pageType, 'BMICalcSubmit'));


    switch (values.unit) {
    case Unit.IMPERIAL:
      const feetToIncheConvertNumber = 12;
      const inchHeight: number = height * feetToIncheConvertNumber + heightSuffix;
      this.bmi = weight / Math.pow(inchHeight, 2) * this.convertingCoefficient;
      break;

    case Unit.METRIC:
      const metricToCmConvertNumber = 100;
      this.bmi = weight / Math.pow(height / metricToCmConvertNumber, 2);
      break;
    }

    for (const item of this.bmiWidgetFields?.bmiResultStatus) {
      if (this.bmi >= item.fields.rangeFrom && this.bmi <= item.fields.rangeTo) {
        this.selectedBMI = item;
      }
    }

    if (this.selectedBMI) {
      // calculate point position in range
      this.selectedRangePerc = ((this.bmi - this.selectedBMI.fields.rangeFrom) / (this.selectedBMI.fields.rangeTo - this.selectedBMI.fields.rangeFrom) * 100);
    }
    this.activeView = View.RESULT;
  }

}
