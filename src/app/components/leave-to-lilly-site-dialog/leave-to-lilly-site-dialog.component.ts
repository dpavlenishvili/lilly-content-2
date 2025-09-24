import { Component } from '@angular/core';
import { LeavePopup } from '../../directives/leave-popup.directive';
import { DIALOG_KEY } from '../../constants/translation-key';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconButton, MatButton } from '@angular/material/button';

@Component({
  selector: 'lilly-content-leave-to-lilly-site-dialog',
  templateUrl: './leave-to-lilly-site-dialog.component.html',
  styleUrls: ['./leave-to-lilly-site-dialog.component.scss'],
  standalone: true,
  imports: [MatIconButton, MatDialogClose, MatIcon, MatDialogContent, MatDialogActions, MatButton]
})
// We are opening this popup for some regions, when navigating to lilly.com
export class LeaveToLillySiteDialogComponent extends LeavePopup {
  protected readonly DIALOG_KEY = DIALOG_KEY;
}
