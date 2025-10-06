import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientRoutes } from '@careboxhealth/layout1-shared';
import {HelperService} from '../../../services/helper.service';
import { MatButton } from '@angular/material/button';
import { TrialCardComponent } from '../../../shared-features/ui/trial-card/trial-card.component';
import { ListingStore, ListingStoreType } from '@careboxhealth/core';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'lilly-trials-widget',
  templateUrl: './trials-widget.component.html',
  styleUrls: ['./trials-widget.component.scss'],
  imports: [
    MatButton,
    TrialCardComponent,
    MatIcon
  ],
  standalone: true
})
export class TrialsWidgetComponent implements OnInit{
  private _trials;
  @Input()
  set trials(value) {
    if (value && value?.length <= this.initAmountOfTrials) {
      this.isShowAll = true;
    }
    this.noTrials = Boolean(value) && value.length === 0;
    this._trials = value;
  }
  get trials() {
    return this._trials;
  }

  isShowAll = false;
  initAmountOfTrials = 5;
  noTrials = false;

  ClientRoutes = ClientRoutes;

  get loading() {
    return !Array.isArray(this.trials);
  }

  // injections
  protected readonly store: ListingStoreType = inject(ListingStore);

  constructor(
    private router: Router,
    private helperService: HelperService
  ) {}
  ngOnInit(): void {
    this.helperService.setGtAttrForNestedElementsByGtmValue('preQualifyTrialCardSubsitePage', 'mat-icon');
  }

  selectTrial(trial) {
    void this.router.navigate([ClientRoutes.TrialSummary, trial?.externalTrialId], {state: {isBackButtonShown: true}});
  }

  createTrialSummaryUrl(trial) {
    return this.helperService.generateTrialUrl(trial);
  }
}
