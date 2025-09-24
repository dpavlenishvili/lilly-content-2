import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { LeavePopup } from '../../directives/leave-popup.directive';
import { HelperService } from '@careboxhealth/layout1-shared';
import { DIALOG_KEY } from 'src/app/constants/translation-key';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDialogContent, MatDialogClose, MatDialogActions } from '@angular/material/dialog';

@Component({
  selector: 'lilly-content-leave-country-dialog',
  templateUrl: './leave-country-dialog.component.html',
  styleUrls: ['./leave-country-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogContent,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogActions,
    MatButton,
  ],
})
export class LeaveCountryDialogComponent extends LeavePopup {
  protected readonly DIALOG_KEY = DIALOG_KEY;

  constructor(
    protected languageService: LanguageService,
    injector: Injector,
    helperService: HelperService
  ) {
    super(injector, helperService);
  }


  get regionLabel(): string {
    // \xa0 - &nbsp;
    return this.languageService.selected.countryName.replace(' ', '\xa0');
  }
}
