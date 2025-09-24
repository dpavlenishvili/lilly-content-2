import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject, input,
  Input, InputSignal,
  OnDestroy,
  Output,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

@Directive({
  selector: '[appOverlayTrigger]',
  standalone: true,
  exportAs: 'appOverlayTrigger',
})
export class OverlayTriggerDirective implements OnDestroy {
  initialPosition: InputSignal<ConnectedPosition> = input();
  @Input('appOverlayTrigger') overlayTemplate?: TemplateRef<unknown>;
  @Input() mode: 'both' | 'click' = 'both';
  @Input() outsideClose: 'hover-or-click' | 'click-only' | 'none' = 'hover-or-click';
  @Input() overlayContainer?: HTMLElement | ElementRef<HTMLElement> | null;
  @Input() overlayClass?: string | string[];

  @Output() isOpenChange = new EventEmitter<boolean>();

  public isOpen = false;

  private overlayRef?: OverlayRef;
  private cleanupFns: Array<() => void> = [];
  private focusTrap?: FocusTrap;
  private lastFocusedTrigger?: HTMLElement;
  private resizeCleanup?: () => void;

  private containerResizeObs?: ResizeObserver;
  private containerResizeCleanup?: () => void;

  constructor(
      private overlay: Overlay,
      private host: ElementRef<HTMLElement>,
      private vcr: ViewContainerRef,
      private focusTrapFactory: FocusTrapFactory,
      @Inject(DOCUMENT) private document: Document
  ) {}

  // -------- Public API --------
  toggle(): void { this.isOpen ? this.close() : this.open(); }

  open(): void {
    if (this.isOpen || !this.overlayTemplate) return;

    const containerEl = this.resolveContainer();
    const useGlobal = !containerEl;

    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
    ];

    if (this.initialPosition()) {
      positions.unshift(this.initialPosition());
    }

    const positionStrategy = useGlobal
      ? this.overlay.position().global().top('0').left('0')
      : this.overlay.position()
        .flexibleConnectedTo(containerEl!)
        .withPositions(positions)
        .withFlexibleDimensions(true)
        .withPush(true);

    const useBackdrop = this.outsideClose === 'click-only';
    const overlayConfig: OverlayConfig = {
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: useBackdrop,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    };

    this.overlayRef = this.overlay.create(overlayConfig);

    const portal = new TemplatePortal(this.overlayTemplate, this.vcr);
    this.overlayRef.attach(portal);

    const pane = this.overlayRef.overlayElement;
    pane.classList.add('cb-overlay-panel');

    if (this.overlayClass) {
      const classes = Array.isArray(this.overlayClass)
        ? this.overlayClass
        : this.overlayClass.split(' ').filter(Boolean);
      classes.forEach(c => pane.classList.add(c));
    }

    // ---------- Size ----------
    if (useGlobal) {
      this.sizeOverlayToViewport();
      const win = this.getWin();
      if (win) {
        const onResize = () => this.sizeOverlayToViewport();
        win.addEventListener('resize', onResize);
        this.resizeCleanup = () => win.removeEventListener('resize', onResize);
      }
    } else {
      const rect = containerEl!.getBoundingClientRect();
      this.overlayRef.updateSize({ width: rect.width });

      // initial maxHeight from overlay top
      requestAnimationFrame(() => this.updateMaxHeightFromOverlayTop());

      // keep width synced to container size changes
      const updateFromContainer = () => {
        if (!this.overlayRef) return;
        const r = containerEl!.getBoundingClientRect();
        this.overlayRef.updateSize({ width: r.width });
        requestAnimationFrame(() => this.updateMaxHeightFromOverlayTop());
        this.overlayRef.updatePosition();
      };

      const win = this.getWin();
      const ResizeObsCtor =
          (win && (win as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver) ??
          (typeof ResizeObserver !== 'undefined' ? ResizeObserver : undefined);

      if (ResizeObsCtor) {
        this.containerResizeObs = new ResizeObsCtor(() => updateFromContainer());
        this.containerResizeObs.observe(containerEl!);
        this.containerResizeCleanup = () => this.containerResizeObs?.disconnect();
      } else if (win) {
        const onWinResize = () => updateFromContainer();
        win.addEventListener('resize', onWinResize);
        this.containerResizeCleanup = () => win.removeEventListener('resize', onWinResize);
      }
    }

    // Animate in
    requestAnimationFrame(() => pane.classList.add('cb-overlay-open'));

    // ---------- Outside interactions ----------
    if (useBackdrop) {
      const sub = this.overlayRef.backdropClick().subscribe(() => this.close());
      this.cleanupFns.push(() => sub.unsubscribe());
    } else if (this.outsideClose !== 'none') {
      const onDocClick = (ev: MouseEvent) => {
        const target = ev.target as Node;
        if (!this.host.nativeElement.contains(target) && !pane.contains(target)) this.close();
      };
      this.document.addEventListener('click', onDocClick, true);
      this.cleanupFns.push(() => this.document.removeEventListener('click', onDocClick, true));
    }

    if (!useGlobal && this.outsideClose === 'hover-or-click') {
      const onOverlayLeave = (ev: MouseEvent) => {
        const related = ev.relatedTarget as Node | null;
        const intoTrigger = !!(related && this.host.nativeElement.contains(related));
        const intoContainer = !!(related && containerEl && containerEl.contains(related as Node));
        if (!intoTrigger && !intoContainer) this.close();
      };
      pane.addEventListener('mouseleave', onOverlayLeave);
      this.cleanupFns.push(() => pane.removeEventListener('mouseleave', onOverlayLeave));

      if (containerEl) {
        const onContainerLeave = (ev: MouseEvent) => {
          const related = ev.relatedTarget as Node | null;
          const intoOverlay = !!(related && pane.contains(related));
          const intoTrigger = !!(related && this.host.nativeElement.contains(related));
          if (!intoOverlay && !intoTrigger) this.close();
        };
        containerEl.addEventListener('mouseleave', onContainerLeave);
        this.cleanupFns.push(() => containerEl.removeEventListener('mouseleave', onContainerLeave));
      }
    }

    // ---------- A11y ----------
    this.lastFocusedTrigger = this.host.nativeElement;
    pane.setAttribute('tabindex', '-1');
    this.focusTrap = this.focusTrapFactory.create(pane);

    setTimeout(() => {
      const focused = this.focusFirstTabbable(pane);
      if (!focused) pane.focus();
    });

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        ev.preventDefault();
        this.close();
        return;
      }
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp' || ev.key === 'Home' || ev.key === 'End') {
        const items = this.getFocusable(pane);
        if (!items.length) return;
        const active = this.document.activeElement as HTMLElement | null;
        let idx = Math.max(0, items.findIndex(el => el === active));
        if (ev.key === 'ArrowDown') idx = (idx + 1) % items.length;
        if (ev.key === 'ArrowUp') idx = (idx - 1 + items.length) % items.length;
        if (ev.key === 'Home') idx = 0;
        if (ev.key === 'End') idx = items.length - 1;
        ev.preventDefault();
        items[idx].focus();
      }
    };
    pane.addEventListener('keydown', onKeyDown);
    this.cleanupFns.push(() => pane.removeEventListener('keydown', onKeyDown));

    this.isOpen = true;
    this.isOpenChange.emit(true);
  }

  close(): void {
    if (!this.isOpen) return;

    this.overlayRef?.overlayElement.classList.remove('cb-overlay-open');
    setTimeout(() => this.overlayRef?.detach(), 80);

    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];

    if (this.resizeCleanup) { this.resizeCleanup(); this.resizeCleanup = undefined; }
    if (this.containerResizeCleanup) { this.containerResizeCleanup(); this.containerResizeCleanup = undefined; }
    if (this.containerResizeObs) { this.containerResizeObs.disconnect(); this.containerResizeObs = undefined; }

    this.focusTrap?.destroy();
    this.focusTrap = undefined;

    if (this.lastFocusedTrigger) {
      setTimeout(() => this.lastFocusedTrigger?.focus());
      this.lastFocusedTrigger = undefined;
    }

    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  ngOnDestroy(): void {
    this.destroyOverlay();
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    if (this.resizeCleanup) { this.resizeCleanup(); this.resizeCleanup = undefined; }
    if (this.containerResizeCleanup) { this.containerResizeCleanup(); this.containerResizeCleanup = undefined; }
    if (this.containerResizeObs) { this.containerResizeObs.disconnect(); this.containerResizeObs = undefined; }
  }

  // -------- Host events --------
  @HostListener('click') onHostClick(): void {
    if (this.mode === 'click' || this.mode === 'both') this.toggle();
  }
  @HostListener('mouseenter') onHostMouseEnter(): void {
    if (this.mode === 'both' && !this.isOpen) this.open();
  }
  @HostListener('mouseleave', ['$event']) onHostMouseLeave(ev: MouseEvent): void {
    if (!this.isOpen || this.outsideClose !== 'hover-or-click') return;
    const related = ev.relatedTarget as Node | null;
    const pane = this.overlayRef?.overlayElement;
    const containerEl = this.resolveContainer();
    if (pane && related && pane.contains(related)) return;
    if (related && containerEl && containerEl.contains(related as Node)) return;
    this.close();
  }

  // -------- Helpers --------
  private resolveContainer(): HTMLElement | null {
    if (!this.overlayContainer) return null;
    if (this.overlayContainer instanceof ElementRef) return this.overlayContainer.nativeElement;
    return this.overlayContainer as HTMLElement;
  }

  private destroyOverlay(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
  }

  // SSR/typing-safe Window getter
  private getWin(): (Window & { ResizeObserver?: typeof ResizeObserver }) | null {
    return this.document.defaultView ?? null;
  }

  private sizeOverlayToViewport(): void {
    if (!this.overlayRef) return;
    const win = this.getWin();
    const vw = win ? win.innerWidth : this.document.documentElement.clientWidth;
    const vh = win ? win.innerHeight : this.document.documentElement.clientHeight;
    this.overlayRef.updateSize({ width: vw, maxHeight: vh });
    this.overlayRef.overlayElement.style.width = `${vw}px`;
  }

  private updateMaxHeightFromOverlayTop(): void {
    if (!this.overlayRef) return;
    const pane = this.overlayRef.overlayElement;
    const overlayRect = pane.getBoundingClientRect();
    const win = this.getWin();
    const viewportH = win ? win.innerHeight : this.document.documentElement.clientHeight;
    const spaceFromTop = Math.max(0, viewportH - overlayRect.top - 8);
    this.overlayRef.updateSize({ maxHeight: spaceFromTop || undefined });
  }

  private getFocusable(root: HTMLElement): HTMLElement[] {
    const sel =
        'a[href],area[href],button:not([disabled]),input:not([disabled]),' +
        'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
      el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    );
  }

  private focusFirstTabbable(root: HTMLElement): boolean {
    const items = this.getFocusable(root);
    if (!items.length) return false;
    items[0].focus();
    return true;
  }
}
