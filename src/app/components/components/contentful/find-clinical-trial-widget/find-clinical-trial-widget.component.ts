import { Component, Input } from '@angular/core';
import { IHomePageFindWidgetFields } from '../models/contentful';
import { FindClinicalTrialComponent } from '../../find-clinical-trial/find-clinical-trial.component';

@Component({
  selector: 'lilly-find-clinical-trial-widget',
  templateUrl: './find-clinical-trial-widget.component.html',
  styleUrls: ['./find-clinical-trial-widget.component.scss'],
  imports: [
    FindClinicalTrialComponent
  ],
  standalone: true
})
export class FindClinicalTrialWidgetComponent {
  @Input() widgetFields: IHomePageFindWidgetFields;
  @Input() containerClass: string = '';
  @Input() wrapClass: string = 'cst--my-0 my-0';
  @Input() contentColClass: string = '';
}
