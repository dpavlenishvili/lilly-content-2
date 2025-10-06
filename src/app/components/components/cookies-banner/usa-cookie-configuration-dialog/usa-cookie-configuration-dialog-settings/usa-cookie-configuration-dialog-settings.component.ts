import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieConsentService } from '@careboxhealth/core';
import { CookiePermissions } from '@careboxhealth/core';
import { externalRoutes } from '../../../../configurations/links';
import { Subject } from 'rxjs';
import { OrderableMatDialog } from '@careboxhealth/layout1-shared';
import { ClientRoutes } from '../../../../common/client-routes';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lilly-usa-cookie-configuration-dialog-settings',
  templateUrl: './usa-cookie-configuration-dialog-settings.component.html',
  styleUrls: ['../scss/usa-cookie-configuration-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogContent,
    RouterLink,
    MatIcon,
    NgIf,
    MatSlideToggle,
    MatDialogActions,
    MatButton,
  ],
})
export class UsaCookieConfigurationDialogSettingsComponent extends OrderableMatDialog {
  cookieSettings: UntypedFormGroup;

  private saveSettingClickSubject = new Subject();
  saveSettingClick$ = this.saveSettingClickSubject.asObservable();

  public readonly externalRoutes = externalRoutes;
  public readonly ClientRoutes = ClientRoutes;

  public ariaLabelMarketing = $localize`:@@usa-cookies-banner.settings.advertising-title:Advertising and Marketing Cookies`;
  public ariaLabelFunctional = $localize`:@@usa-cookies-banner.settings.functional-title:Functional Cookies`;
  public ariaLabelPerformance = $localize`:@@usa-cookies-banner.settings.performance-title:Performance Cookies (Analytics)`;

  constructor(
    private dialogRef: MatDialogRef<UsaCookieConfigurationDialogSettingsComponent>,
    private cookieConsentService: CookieConsentService,
    elementRef: ElementRef
  ) {
    super(elementRef);
    const currentCookies: Partial<CookiePermissions> = this.cookieConsentService.currentCookiePermissions ?? {};
    this.cookieSettings = new UntypedFormGroup({
      necessary: new UntypedFormControl(true),
      preferences: new UntypedFormControl(currentCookies.preferences ?? true),
      statistics: new UntypedFormControl(currentCookies.statistics ?? true),
      marketing: new UntypedFormControl(currentCookies.marketing ?? true),
    });
  }

  getZIndex(): number {
    return 10001;
  }

  close(): void {
    this.dialogRef.close();
  }

  saveSettings(): void {
    this.cookieConsentService.setAcceptedCookiePermissions(this.cookieSettings.value, true);
    this.saveSettingClickSubject.next();
    this.close();
  }

  switchToggle(controlName: string): void {
    const control =  this.cookieSettings.get(controlName);
    control.setValue(!control.value);
  }
}
