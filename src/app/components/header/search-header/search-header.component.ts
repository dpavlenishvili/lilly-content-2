import {
  ChangeDetectionStrategy,
  Component, ElementRef, input, InputSignal, output, OutputEmitterRef, viewChild,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatAnchor, MatButtonModule, MatIconButton} from '@angular/material/button';
import { OverlayTriggerDirective } from '../../../directives/overlay-trigger.directive';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'search-header',
  standalone: true,
  imports: [
    NgClass,
    MatIcon,
    MatAnchor,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    OverlayTriggerDirective,
    MatInput
  ],
  templateUrl: './search-header.component.html',
  styleUrl: './search-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchHeaderComponent {
  overlayContainer: InputSignal<HTMLElement | ElementRef<HTMLElement> | null> = input();
  menuOpen: OutputEmitterRef<boolean>  = output();

  triggerButton = viewChild<MatIconButton>('menuTrigger');
  onEscape(): void {
    window.requestAnimationFrame(() => {
      this.triggerButton()?.focus();
    });
  }
}
