import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Directive, inject, Injector } from '@angular/core';
import { HelperService, LinkTarget } from '@careboxhealth/layout1-shared';
import { LeavePopupData } from '../interfaces/popup-data.interface';
import { AppIconRegistry } from '../services/app-icon-registry.service';

@Directive()
export class LeavePopup {
  public dialogRef: MatDialogRef<unknown>;
  public data: LeavePopupData | null;

  private readonly iconRegistry: AppIconRegistry = inject(AppIconRegistry);

  constructor(protected injector: Injector, private helperService: HelperService) {
    this.dialogRef = this.injector.get(MatDialogRef);
    this.data = this.injector.get(MAT_DIALOG_DATA);
    this.registerIcons();
  }

  registerIcons(): void {
    this.iconRegistry.addSvgIcon('close', '/assets/svg/lilly/close.svg');
    this.iconRegistry.addSvgIcon('lilly', '/assets/svg/lilly/lilly.svg');
  }

  leaveLillyTrials(): void {
    // We should open link here, not in afterClosed subscription, because safari allows to open tabs only in the same frame with click
    // So, we can't loose time and should open link right after click
    if (this.data?.link) {
      const target = (this.data.target as LinkTarget) ?? LinkTarget.Blank;
      this.helperService.windowOpen(this.data.link, target);
    }
    this.dialogRef.close(true);
  }
}
