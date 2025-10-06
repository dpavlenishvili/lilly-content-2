import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { ClientRoutes } from '../../../common/client-routes';
import { HelperService } from 'src/app/services/helper.service';
import { CookieConsentService, CookiePermissions } from '@careboxhealth/core';
import { OrderableMatDialog, HideForRegionsDirective, ShowForRegionsDirective } from '@careboxhealth/layout1-shared';
import { externalRoutes } from 'src/app/configurations/links';
import { Language } from '../../../enums/language';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';


@Component({
  selector: 'lilly-cookies-configurations-dialog',
  templateUrl: './cookies-configurations-dialog.component.html',
  styleUrls: ['./cookies-configurations-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogContent, FormsModule, ReactiveFormsModule, HideForRegionsDirective,
    ShowForRegionsDirective, MatSlideToggle, NgIf, MatDialogActions, MatButton
  ]
})
export class CookiesConfigurationsDialogComponent extends OrderableMatDialog implements OnInit, OnDestroy {

  form: FormGroup;

  showMoreFirst = false;
  showMoreSecond = false;
  showMoreThird = false;
  destroy$ = new Subject();

  readonly clientRoutes = ClientRoutes;
  readonly externalRoutes = externalRoutes;
  readonly Language = Language;

  getZIndex(): number {
    return 10000;
  }

  constructor(public dialogRef: MatDialogRef<CookiesConfigurationsDialogComponent>,
              protected helperService: HelperService,
              protected cookieConsentService: CookieConsentService,
              elementRef: ElementRef
  ) {
    super(elementRef);
    dialogRef.disableClose = true;
    const currentCookies: Partial<CookiePermissions> = this.cookieConsentService.currentCookiePermissions ?? {};
    this.form = new FormGroup({
      acceptAllCookies: new FormControl<boolean>(!!(currentCookies.statistics && currentCookies.marketing)),
      performanceCookies: new FormControl<boolean>(!!currentCookies.statistics),
      performanceCookiesCopy: new FormControl<boolean>(!!currentCookies.statistics),
      analyticsCookiesCopy: new FormControl<boolean>(!!currentCookies.marketing),
      analyticsCookies: new FormControl<boolean>(!!currentCookies.marketing)
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.form.get('acceptAllCookies').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.form.patchValue({
        performanceCookies: data,
        analyticsCookies: data
      });
    });

    const performanceCookies$ = this.form.get('performanceCookies').valueChanges;
    const analyticsCookies$ = this.form.get('analyticsCookies').valueChanges;
    combineLatest([
      performanceCookies$.pipe(startWith(this.form.get('performanceCookies').value)),
      analyticsCookies$.pipe(startWith(this.form.get('analyticsCookies').value))
    ]).subscribe(([performanceCookies, analyticsCookies]) => {
      if (this.form.get('acceptAllCookies').value !== (performanceCookies && analyticsCookies)) {
        this.form.patchValue({
          acceptAllCookies: performanceCookies && analyticsCookies
        });
        // switch one cookie from the state, where both are true will cause setting both cookies to false from previous subscription.
        // Need to recover correct value.
        this.form.patchValue({
          performanceCookies,
          analyticsCookies
        });
      }
    });

    const syncPairs = [
      ['performanceCookies', 'performanceCookiesCopy'],
      ['analyticsCookies', 'analyticsCookiesCopy']
    ];
    for (const pair of syncPairs) {
      for (const [itemToSubscribe, itemToUpdate] of [
        [pair[0], pair[1]],
        [pair[1], pair[0]]
      ]) {
        this.form.get(itemToSubscribe).valueChanges.subscribe(value => {
          const control = this.form.get(itemToUpdate);
          if (control.value !== value) {
            const patchValue = {};
            patchValue[itemToUpdate] = value;
            this.form.patchValue(patchValue);
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  accept() {
    if (this.form.value.acceptAllCookies) {
      this.acceptAll();
      return;
    }

    const cookiePermissions = {
      ...this.cookieConsentService.defaultCookiePermissions,
      preferences: true,
      statistics: this.form.value.performanceCookies,
      marketing: this.form.value.analyticsCookies
    };
    this.cookieConsentService.setSelectedCookiePermissions(cookiePermissions);
  }

  acceptAll() {
    this.cookieConsentService.accept();
  }

  reject() {
    this.cookieConsentService.decline();
  }

  openLink(link) {
    this.helperService.openDialog(link);
  }
}
