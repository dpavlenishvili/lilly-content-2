import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { KalturaService } from './kaltura.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VideoAnalyticsEvent } from '../video-analytics-event.enum';
import { MediaContentService } from '../media-content.service';

declare const window;

const VIDEO_STATE = {
  playing: VideoAnalyticsEvent.PLAY,
  paused: VideoAnalyticsEvent.PAUSE
};

const KALTURA_CONFIG = {
  PARTNER_ID: '1759891',
  UI_CONFIG_ID: '29415272'
};

interface IKalturaPlayer {
  addJsListener(event: string, callback: (...args: unknown[]) => void): void;
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

  @Input() private entryId: string;
  @Input() private partnerId: string = KALTURA_CONFIG.PARTNER_ID;
  @Input() private isAutoplay = false;
  @Input() private isMuted = true;
  @Input() private isLoop = true;
  @Input() public title: string;
  @Input() private subsiteName: string;

  @Input()
  set uiConfigId(value: string) {
    if (!value) return;

    this._uiConfigId = value;
  }

  get uiConfigId() {
    return this._uiConfigId;
  }

  private _uiConfigId = KALTURA_CONFIG.UI_CONFIG_ID;
  private _onDestroy = new Subject<void>();
  private protectedElements = new WeakSet<HTMLElement>();

  constructor(@Inject(DOCUMENT) private document: Document,
              private kalturaService: KalturaService,
              private elementRef: ElementRef,
              private mediaContentAnalytics: MediaContentService) {
  }

  public ngOnInit(): void {
    this.kalturaService.loadKalturaScript(this.partnerId, this.uiConfigId);
  }

  public ngAfterViewInit(): void {
    if (!this.entryId) {
      return;
    }

    this.kalturaService.kalturaScriptLoaded$.pipe(
      filter((isLoaded: boolean) => isLoaded),
      takeUntil(this._onDestroy)
    ).subscribe(() => {
      window?.kWidget?.embed({
        targetId: this.playerId,
        wid: `_${this.partnerId}`,
        uiconf_id: this.uiConfigId,
        flashvars: {
          autoPlay: this.isAutoplay,
          mobileAutoPlay: this.isAutoplay,
          loop: this.isLoop,
          'EmbedPlayer.WebKitPlaysInline': true,
          ...this.muteConfiguration
        },
        entry_id: this.entryId,
        readyCallback: this.addEventHandler.bind(this)
      });
    });
  }

  public ngOnDestroy(): void {
    window?.kWidget?.destroy(this.playerId);
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private get muteConfiguration() {
    return this.isMuted ? {} : {
      autoMute: false,
      'unMuteOverlayButton.plugin': false,
    };
  }

  private addEventHandler(): void {
    const player = this.document.getElementById(this.playerId) as unknown as IKalturaPlayer;

    player.addJsListener('playerStateChange', (playerState: string) => {
      this.sendAnalytic(playerState);
    });

    player.addJsListener('mediaError', () => {
      this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName, this.title);
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

    if (analysedState) {
      this.mediaContentAnalytics.sendMediaAnalytics(analysedState, this.subsiteName, this.title);
    }
  }

  private get randomId(): number {
    return Math.floor(Math.random() * 1000);
  }
}
