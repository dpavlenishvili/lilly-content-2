import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Inject,
  input,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { KalturaService } from './kaltura.service';
import { filter } from 'rxjs/operators';
import { VideoAnalyticsEvent } from '../video-analytics-event.enum';
import { MediaContentService } from '../media-content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare const window;

const VIDEO_STATE = {
  playing: VideoAnalyticsEvent.PLAY,
  paused: VideoAnalyticsEvent.PAUSE,
  ended: VideoAnalyticsEvent.ENDED
};

const KALTURA_CONFIG = {
  PARTNER_ID: '1759891',
  UI_CONFIG_ID: '29415272'
};

interface IKalturaPlayer {
  addJsListener(event: string, callback: (...args: unknown[]) => void): void;
  sendNotification(notification: string): void;
}

@Component({
  selector: 'lilly-kaltura',
  templateUrl: './kaltura.component.html',
  styleUrls: ['./kaltura.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class KalturaComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly playerId = `kalturaPlayer${this.randomId}`;

  readonly entryId = input.required<string>();
  readonly partnerId = input<string>(KALTURA_CONFIG.PARTNER_ID);
  readonly isPlaying = input<boolean>(false);
  readonly isMuted = input<boolean>(true);
  readonly isLoop = input<boolean>(true);
  readonly title = input.required<string>();
  readonly subsiteName = input.required<string>();
  readonly uiConfigIdInput = input<string>('', { alias: 'uiConfigId' });
  readonly isAutoplay = input<boolean>(false);

  readonly ended = output<void>();

  readonly uiConfigId = computed(() => {
    const value = this.uiConfigIdInput();
    return value || KALTURA_CONFIG.UI_CONFIG_ID;
  });

  private protectedElements = new WeakSet<HTMLElement>();
  private readonly destroyRef = inject(DestroyRef);
  private kalturaPlayerInstance?: IKalturaPlayer;

  constructor(@Inject(DOCUMENT) private document: Document,
              private kalturaService: KalturaService,
              private elementRef: ElementRef,
              private mediaContentAnalytics: MediaContentService) {
    effect(() => {
      const shouldPlay = this.isPlaying();
      const player = this.kalturaPlayerInstance;

      if (!player) return;

      if (shouldPlay) {
        player.sendNotification('doPlay');
      } else {
        player.sendNotification('doPause');
      }
    });
  }

  public ngOnInit(): void {
    this.kalturaService.loadKalturaScript(this.partnerId(), this.uiConfigId());
  }

  public ngAfterViewInit(): void {
    if (!this.entryId()) {
      return;
    }

    this.kalturaService.kalturaScriptLoaded$.pipe(
      filter((isLoaded: boolean) => isLoaded),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      window?.kWidget?.embed({
        targetId: this.playerId,
        wid: `_${this.partnerId()}`,
        uiconf_id: this.uiConfigId(),
        flashvars: {
          autoPlay: this.isAutoplay(),
          mobileAutoPlay: this.isAutoplay(),
          loop: this.isLoop(),
          'EmbedPlayer.WebKitPlaysInline': true,
          ...this.muteConfiguration
        },
        entry_id: this.entryId(),
        readyCallback: this.addEventHandler.bind(this),
        endedCallback: () => this.sendAnalytic('ended'),
      });
    });
  }

  public ngOnDestroy(): void {
    window?.kWidget?.destroy(this.playerId);
  }

  private get muteConfiguration() {
    return this.isMuted() ? {} : {
      autoMute: false,
      'unMuteOverlayButton.plugin': false,
    };
  }

  private addEventHandler(): void {
    const player = this.document.getElementById(this.playerId) as unknown as IKalturaPlayer;
    this.kalturaPlayerInstance = player;

    player.addJsListener('playerStateChange', (playerState: string) => {
      this.sendAnalytic(playerState);
    });

    player.addJsListener('playerPlayEnd', () => {
      this.sendAnalytic('ended');
    });

    player.addJsListener('onEndedDone', () => {
      this.sendAnalytic('ended');
    });

    player.addJsListener('mediaError', () => {
      this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName(), this.title());
    });

    player.addJsListener('playerReady', () => {
      const iframe = this.elementRef.nativeElement.querySelector('iframe');

      const video: HTMLElement = iframe?.contentWindow?.document?.querySelector('video');
      video?.setAttribute('crossorigin', 'anonymous');

      const allWithTabindex: HTMLElement[] = iframe?.contentWindow?.document?.querySelectorAll('[tabindex]');
      allWithTabindex?.forEach(el => {
        const tabindex = parseInt(el.getAttribute('tabindex'), 10);
        if (tabindex > 0) {
          el.setAttribute('tabindex', '0');
        }
      });

      player.addJsListener('durationChange', () => {
        const ifr = this.elementRef.nativeElement.querySelector('iframe');
        if (ifr) this.fixAriaValuenowInKaltura(ifr);
      });

      this.fixAriaValuenowInKaltura(iframe);

      // When player is ready, check if we should be playing and send the command
      // This handles the case where the component mounts with isPlaying=true but the effect
      // ran before the player instance was ready
      const shouldPlay = this.isPlaying();
      if (shouldPlay) {
        requestAnimationFrame(() => {
          player.sendNotification('doPlay');
        });
      }
    });
  }

  private fixAriaValuenowInKaltura(iframe: HTMLIFrameElement): void {
    try {
      const d = iframe?.contentWindow?.document;
      if (!d) return;

      d.querySelectorAll<HTMLElement>('[role="slider"][aria-valuenow]').forEach(el => {
        const normalized = this.normalizeAriaFromPercent(el, el.getAttribute('aria-valuenow'));
        if (normalized !== null) el.setAttribute('aria-valuenow', normalized);
        this.protectElement(el);
      });
    } catch {
      // Cross-origin iframe - security restrictions prevent DOM access
    }
  }

  private protectElement(element: HTMLElement): void {
    if (this.protectedElements.has(element)) return;

    // Override the native setAttribute method to normalize 'aria-valuenow'
    const original = element.setAttribute.bind(element);
    const normalize = this.normalizeAriaFromPercent.bind(this);

    element.setAttribute = function (name: string, value: string) {
      if (name === 'aria-valuenow') {
        const normalized = normalize(element, value);
        if (normalized !== null) value = normalized;
      }
      return original(name, value);
    };

    this.protectedElements.add(element);
  }

  private normalizeAriaFromPercent(el: HTMLElement, raw: string | null): string | null {
    if (!raw || !raw.endsWith('%')) return null;
    const pct = parseFloat(raw);
    if (Number.isNaN(pct)) return null;

    const max = parseFloat(el.getAttribute('aria-valuemax') || '100');
    const min = parseFloat(el.getAttribute('aria-valuemin') || '0');
    const span = max - min;
    const actual = span ? min + (pct / 100) * span : min;

    return Math.round(actual).toString();
  }

  private sendAnalytic(videoState: string): void {
    const analysedState = VIDEO_STATE[videoState];

    if (analysedState === VideoAnalyticsEvent.ENDED) {
      this.ended.emit();
    }

    if (analysedState) {
      this.mediaContentAnalytics.sendMediaAnalytics(analysedState, this.subsiteName(), this.title());
    }
  }

  private get randomId(): number {
    return Math.floor(Math.random() * 1000);
  }
}
