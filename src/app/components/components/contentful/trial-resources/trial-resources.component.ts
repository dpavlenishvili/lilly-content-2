import { Component, Input, OnInit } from '@angular/core';
import { IResource } from '../models/contentful';
import { ResourceComponent } from './resource/resource.component';
import { MatButton } from '@angular/material/button';

import {SectionWrapperModule} from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';

@Component({
  selector: 'lilly-trial-resources',
  templateUrl: './trial-resources.component.html',
  styleUrls: ['./trial-resources.component.scss'],
  imports: [
    ResourceComponent,
    MatButton,
    SectionWrapperModule
  ],
  standalone: true
})
export class TrialResourcesComponent implements OnInit {
  @Input() resources: IResource[];
  @Input() trialId: number;
  showAllResources;
  initAmountOfTrials = 5;

  ngOnInit(): void {
    this.showAllResources =  !(this.resources?.length > this.initAmountOfTrials);
  }
}
