import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {IClinicalTrialEssentialsWidgetFields} from '../models/contentful';
import {MdToHtmlPipe} from '../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-clinical-trial-essentials-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MdToHtmlPipe
  ],
  templateUrl: './clinical-trial-essentials-widget.component.html',
  styleUrls: ['./clinical-trial-essentials-widget.component.scss']
})
export class ClinicalTrialEssentialsWidgetComponent {
  @Input() widgetFields?: IClinicalTrialEssentialsWidgetFields;
}
