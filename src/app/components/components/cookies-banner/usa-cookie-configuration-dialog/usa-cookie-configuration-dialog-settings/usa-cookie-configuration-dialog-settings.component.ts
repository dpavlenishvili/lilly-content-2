import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieConsentService } from '@careboxhealth/core';
import { CookiePermissions } from '@careboxhealth/core';
import { externalRoutes } from '../../../../configurations/links';
import { Subject } from 'rxjs';
import { OrderableMatDialog, LinkTarget } from '@careboxhealth/layout1-shared';
import { ClientRoutes } from '../../../../common/client-routes';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppIconRegistry } from '../../../../services/app-icon-registry.service';

@Component({
  selector: 'lilly-content-usa-cookie-configuration-dialog-settings',
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
    MatSlideToggle,
    MatDialogActions,
    MatButton,
  ],
})
export class UsaCookieConfigurationDialogSettingsComponent extends OrderableMatDialog {
  cookieSettings: UntypedFormGroup;

  private saveSettingClickSubject = new Subject();
  saveSettingClick$ = this.saveSettingClickSubject.asObservable();

  public readonly externalRoutes: Record<string, string> = externalRoutes;
  public readonly ClientRoutes: Record<string, string> = ClientRoutes;
  public readonly LinkTarget = LinkTarget;

  public readonly ariaLabelMarketing: string = $localize`:@@usa-cookies-banner.settings.advertising-title:Advertising and Marketing Cookies`;
  public readonly ariaLabelFunctional: string = $localize`:@@usa-cookies-banner.settings.functional-title:Functional Cookies`;
  public readonly ariaLabelPerformance: string = $localize`:@@usa-cookies-banner.settings.performance-title:Performance Cookies (Analytics)`;

  private readonly dialogRef: MatDialogRef<UsaCookieConfigurationDialogSettingsComponent> = inject(MatDialogRef<UsaCookieConfigurationDialogSettingsComponent>);
  private readonly cookieConsentService: CookieConsentService = inject(CookieConsentService);
  private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);

  constructor(elementRef: ElementRef) {
    super(elementRef);
    this.registerIcons();
    const currentCookies: Partial<CookiePermissions> = this.cookieConsentService.currentCookiePermissions ?? {};
    this.cookieSettings = new UntypedFormGroup({
      necessary: new UntypedFormControl(true),
      preferences: new UntypedFormControl(currentCookies.preferences ?? true),
      statistics: new UntypedFormControl(currentCookies.statistics ?? true),
      marketing: new UntypedFormControl(currentCookies.marketing ?? true),
    });
  }

  registerIcons(): void {
    this.iconRegistry.addSvgIcon('check', '/assets/svg/lilly/check.svg');
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
