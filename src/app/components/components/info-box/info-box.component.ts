import {
  ChangeDetectionStrategy,
  Component, DestroyRef,
  ElementRef, inject, Input, input,
  OnDestroy, OnInit, Renderer2,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin, Overlay } from '@angular/cdk/overlay';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { OverlaysService } from '../../services/overlays.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lilly-info-box',
  standalone: true,
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './info-box.component.html',
  styleUrl: './info-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoBoxComponent implements OnInit, OnDestroy {
  public readonly tooltip = input.required();
  private readonly uniqTooltipId = Math.random().toString(36).substr(2, 9);
  @ViewChild('popup', {static: false}) popup!: ElementRef;
  @ViewChild('trigger') trigger!: CdkOverlayOrigin;
  @ViewChild(CdkConnectedOverlay) cdkConnectedOverlay: CdkConnectedOverlay;
  readonly arrowSize: { width: number; height: number; } = {width: 12, height: 12};
  public isFromKeyboard = false;
  private positionX: number;
  private openedOverlayId: string;
  private readonly arrowClass = 'popup-info__arrow';
  private readonly tabletSize = 1000;
  isOverlayOpened: WritableSignal<boolean> = signal(false);
  wasOpenedByClick: WritableSignal<boolean> = signal(false);
  arrowPosition: WritableSignal<string> = signal(null);
  @Input() iconSrc = 'info-base';

  private overlaysService = inject(OverlaysService);
  private destroyRef = inject(DestroyRef);
  private overlay = inject(Overlay);
  private renderer = inject(Renderer2);
  readonly scrollStrategy = this.overlay.scrollStrategies.close();

  public ngOnInit(): void {
    this.overlaysService.openedOverlay$.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((overlayId: string) => {
      this.openedOverlayId = overlayId;
      this.isOverlayOpened.set(overlayId === this.uniqTooltipId);
    });
  }

  public openOverlay(clickPositionX?: number, isOpenByClick?: boolean): void {
    if (!isOpenByClick && document.body.clientWidth < this.tabletSize) {
      return;
    }

    if (this.openedOverlayId && this.openedOverlayId === this.uniqTooltipId &&
      this.wasOpenedByClick() && isOpenByClick) {
      this.closeOverlay();
      return;
    }

    if (!this.tooltip || this.wasOpenedByClick() || (this.openedOverlayId && !isOpenByClick) ||
      (this.openedOverlayId && this.openedOverlayId !== this.uniqTooltipId)) {
      return;
    }

    this.wasOpenedByClick.set(isOpenByClick);
    this.overlaysService.openOverlay(this.uniqTooltipId);
    this.positionX = clickPositionX;
    this.updateArrowPosition();
    this.cdkConnectedOverlay?.overlayRef?.updatePosition();
  }

  public closeOverlay(): void {
    this.overlaysService.closeOverlay();
    this.wasOpenedByClick.set(false);
    this.arrowPosition.set(null);
    this.trigger?.elementRef?.nativeElement?.focus();
  }

  public closeByMouseLeave(data): void {
    if (document.body.clientWidth < this.tabletSize || this.wasOpenedByClick() || this.openedOverlayId !== this.uniqTooltipId ||
      data.relatedTarget.classList.contains(this.arrowClass)) {
      return;
    }

    this.overlaysService.closeOverlay();
  }

  public updateArrowPosition(): void {
    if (!this.popup?.nativeElement) {
      return;
    }

    if (this.isFromKeyboard) {
      this.popup.nativeElement.focus();
    }

    if (!this.positionX) {
      this.arrowPosition.set(`calc(50% - ${this.arrowSize.width / 2}px`);
      return;
    }

    const positionX = this.positionX - (this.popup.nativeElement.offsetParent?.offsetLeft || 0) - this.arrowSize.width / 2;
    this.arrowPosition.set(`${positionX}px`);
    this.updateTooltipPosition();
  }

  public detachOverlay(): void {
    if (this.openedOverlayId === this.uniqTooltipId) {
      this.closeOverlay();
    }
  }

  public ngOnDestroy(): void {
    this.closeOverlay();
  }

  private updateTooltipPosition(): void {
    const triggerTopPosition = this.trigger.elementRef?.nativeElement?.getBoundingClientRect()?.top || 0;
    const topPositionClass = 'up';
    let topPosition;

    if (this.popup.nativeElement.offsetParent?.classList?.contains(topPositionClass)) {
      topPosition = triggerTopPosition - this.popup.nativeElement.clientHeight;
    } else {
      topPosition = triggerTopPosition + this.arrowSize.height;
    }

    this.renderer.setStyle(this.popup.nativeElement.offsetParent, 'top', `${topPosition}px`);
    this.renderer.setStyle(this.popup.nativeElement.offsetParent, 'bottom', 'unset');
  }
}
