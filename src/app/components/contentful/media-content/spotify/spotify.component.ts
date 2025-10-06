import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MediaContentService } from '../media-content.service';
import { AudioAnalyticsEvent } from '../audio-analytics-event.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'lilly-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SpotifyComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  @HostBinding('style.background-color') backgroundColor = '#de3626';

  @Input() private entryId: string;
  @Input() private height = '152';
  @Input() public title: string;
  @Input() private subsiteName: string;

  @ViewChild('spotifyPlayer') spotifyPlayer: ElementRef;
  private currentAudioState: AudioAnalyticsEvent;
  private _onDestroy = new Subject<void>();

  constructor(@Inject(DOCUMENT) private document: Document,
              private spotifyService: SpotifyService,
              private mediaContentAnalytics: MediaContentService) {}

  public ngOnInit(): void {
    this.spotifyService.loadSpotifyScript();
  }

  public ngAfterViewInit(): void {
    this.initSpotifyPlayer();
  }

  private initSpotifyPlayer(): void {
    this.spotifyService.spotifyIframeApi$.pipe(
      filter(api => !!api),
      takeUntil(this._onDestroy)
    ).subscribe(api => {
      const options = {
        uri: `spotify:episode:${this.entryId}`,
        height: this.height,
      };
      const callback = EmbedController => {
        EmbedController.addListener('playback_update', eventData => {
          const currentState = eventData.data.isPaused ? AudioAnalyticsEvent.Pause : AudioAnalyticsEvent.Play;

          if (currentState !== this.currentAudioState) {
            this.currentAudioState = currentState;
            this.mediaContentAnalytics.sendMediaAnalytics(currentState, this.subsiteName, this.title);
          }
        });
      };

      try {
        api.createController(this.spotifyPlayer.nativeElement, options, callback);
      } catch (e) {
        this.mediaContentAnalytics.sendMediaAnalytics(AudioAnalyticsEvent.Error, this.subsiteName, this.title);
      }
    });
  }

  public ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
