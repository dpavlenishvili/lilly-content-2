import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation, input, InputSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type IconPosition = 'start' | 'end';

/**
 * Interface defining the configuration options for the CbTagComponent
 */
export interface CbTagConfig {
  /** Text label (optional if you project your own content) */
  text: string;

  /** If true, emits (clicked) on pointer/keyboard activation */
  clickable: boolean;

  dotted: boolean;
  filled: boolean;

  /** If true, tag can be toggled selected via mouse/keyboard */
  selectable: boolean;

  /** Selected state */
  selected: boolean;

  /** If true, shows a close button */
  removable: boolean;

  /** Optional TemplateRef for an icon */
  icon?: TemplateRef<unknown>;

  /** Position for the icon template */
  iconPosition: IconPosition;

  /** Disabled state */
  disabled: boolean;

  /** Optional CSS class */
  tagClass: string;

  uppercased: InputSignal<boolean>;
}

@Component({
  selector: 'cb-tag',
  standalone: true,
  templateUrl: './cb-tag.component.html',
  styleUrls: ['./cb-tag.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet]
})
export class CbTagComponent implements CbTagConfig {
  @HostBinding('class.cb-tag--selected') get isSelected() {
    return this.selected;
  }

  @HostBinding('class.cb-tag--dotted') get isDotted() {
    return this.dotted;
  }
  @HostBinding('class.cb-tag--filled') get isFilled() {
    return this.filled;
  }
  @HostBinding('class.cb-tag--uppercased') get isUppercased() {
    return this.uppercased();
  }

  @HostBinding('class.cb-tag--clickable') get isClickable() {
    return this.clickable || this.selectable;
  }

  @HostBinding('class.cb-tag--disabled') get isDisabled() {
    return this.disabled;
  }

  @HostBinding('attr.role') get role() {
    return (this.clickable || this.selectable) && !this.disabled ? 'button' : 'null';
  }

  @HostBinding('attr.tabindex') get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-disabled') get ariaDisabled() {
    return this.disabled ? 'true' : null;
  }

  @HostBinding('attr.aria-pressed') get ariaPressed() {
    return this.selectable ? this.selected : null;
  }

  @HostBinding('class') get hostClasses(): string {
    return `cb-tag ${this.tagClass}`;
  }

  /** Text label (optional if you project your own content) */
  @Input() text = '';
  @Input() dotted = false;
  @Input() filled = false;
  uppercased = input(false);

  /** If true, emits (clicked) on pointer/keyboard activation */
  @Input() clickable = false;

  /** If true, tag can be toggled selected via mouse/keyboard */
  @Input() selectable = false;

  /** Selected state (also controls the "selected" color variant) */
  @Input() selected = false;

  /** If true, shows a close button and enables remove by Backspace/Delete */
  @Input() removable = false;

  /** Optional TemplateRef for an icon / image (projected via ngTemplateOutlet) */
  @Input() icon?: TemplateRef<unknown>;

  /** Position for the icon template: 'start' | 'end' */
  @Input() iconPosition: IconPosition = 'start';

  /** Disabled state (removes interactivity and focus) */
  @Input() disabled = false;

  /** Emitted on click/keyboard activation when clickable=true */
  @Output() clicked = new EventEmitter<MouseEvent | KeyboardEvent>();

  /** Emitted when user toggles selected state */
  @Output() selectedChange = new EventEmitter<boolean>();

  /** Emitted when the close button is pressed or Backspace/Delete used */
  @Output() removed = new EventEmitter<void>();

  constructor(private readonly el: ElementRef<HTMLElement>) {
  }

  @Input() tagClass = '';

  // Keyboard handling
  @HostListener('keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    if (this.disabled) return;

    const key = ev.key;
    if ((key === 'Enter' || key === ' ') && (this.clickable || this.selectable)) {
      ev.preventDefault();
      if (this.clickable) this.clicked.emit(ev);
    } else if ((key === 'Backspace' || key === 'Delete') && this.removable) {
      ev.preventDefault();
      this.remove();
    }
  }

  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent): void {
    if (this.disabled) return;
    if (this.clickable) this.clicked.emit(ev);
  }

  onRemoveClick(ev: MouseEvent): void {
    ev.stopPropagation();
    if (!this.disabled && this.removable) {
      this.remove();
      // Keep focus on host for good UX
      (this.el.nativeElement as HTMLElement).focus();
    }
  }

  private remove(): void {
    this.removed.emit();
  }
}
