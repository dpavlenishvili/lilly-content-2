import {
  Component,
  input,
  InputSignal,
  ElementRef,
  output,
  OutputEmitterRef,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { LanguageService } from '../../shared-features/ui/language.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { OverlayTriggerDirective } from '../../shared-features/ui/directives/overlay-trigger.directive';

@Component({
  selector: 'lilly-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [
    NgClass,
    MatIcon,
    MatAnchor,
    MatIconButton,
    MatTooltipModule,
    OverlayTriggerDirective
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  overlayContainer: InputSignal<HTMLElement | ElementRef<HTMLElement> | null> = input();
  menuOpen: OutputEmitterRef<boolean>  = output();

  @ViewChild('triggerButton') triggerButton: MatIconButton;

  constructor(
    public languageService: LanguageService,
    protected router: Router,
  ) {}

  setLanguage(language): void {
    this.languageService.setLanguageWithConfirm(language, this.router.url);
  }

  onEscape(): void {
    window.requestAnimationFrame(() => {
      this.triggerButton.focus();
    });
  }
}
