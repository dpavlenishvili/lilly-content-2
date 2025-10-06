import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {
  UsaCookieConfigurationDialogSettingsComponent
} from '../usa-cookie-configuration-dialog-settings/usa-cookie-configuration-dialog-settings.component';
import { CookieConsentService, AnalyticsService } from '@careboxhealth/core';
import { externalRoutes } from '../../../../configurations/links';
import { OrderableMatDialog, LinkTarget } from '@careboxhealth/layout1-shared';
import { ClientRoutes } from '../../../../common/client-routes';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

const ManageCookiesSettingsEvent = 'ManageCookiesSettings';

@Component({
  selector: 'lilly-content-usa-cookie-configuration-dialog-home',
  templateUrl: './usa-cookie-configuration-dialog-home.component.html',
  styleUrls: ['../scss/usa-cookie-configuration-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogContent,
    NgClass,
    RouterLink,
    MatDialogActions,
    MatButton,
  ],
})
export class UsaCookieConfigurationDialogHomeComponent extends OrderableMatDialog {
  showTextMoreMobile = false;
  public readonly externalRoutes: Record<string, string> = externalRoutes;
  public readonly ClientRoutes: Record<string, string> = ClientRoutes;
  public readonly LinkTarget = LinkTarget;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UsaCookieConfigurationDialogHomeComponent>,
    private cookieConsentService: CookieConsentService,
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    elementRef: ElementRef
  ) {
    super(elementRef);
  }

  getZIndex(): number {
    return 10000;
  }

  accept(): void {
    this.cookieConsentService.accept();
    this.dialogRef.close();
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(UsaCookieConfigurationDialogSettingsComponent,{
      panelClass: ['cookies-dialog', 'usa-cookies-dialog'],
      autoFocus: false,
      disableClose: true,
    });
    this.analyticsService.write({
      action: ManageCookiesSettingsEvent
    });
    this.cdr.markForCheck();

    dialogRef.componentInstance.saveSettingClick$.subscribe(() => {
      this.dialogRef.close();
    });
  }

  decline(): void {
    this.cookieConsentService.acceptOnlyNecessary();
    this.dialogRef.close();
  }
}
