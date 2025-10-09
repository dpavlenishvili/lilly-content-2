import { Component } from '@angular/core';
import { LeavePopup } from '../../directives/leave-popup.directive';
import { DIALOG_KEY } from 'src/app/constants/translation-key';
import { MatIcon } from '@angular/material/icon';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'lilly-content-leave-lilly-dialog',
  templateUrl: './leave-lilly-dialog.component.html',
  styleUrls: ['./leave-lilly-dialog.component.scss'],
  standalone: true,
  imports: [MatIconButton, MatDialogClose, MatIcon, MatDialogContent, MatDialogActions, MatButton]
})
export class LeaveLillyDialogComponent extends LeavePopup {
  protected readonly DIALOG_KEY = DIALOG_KEY;
}
