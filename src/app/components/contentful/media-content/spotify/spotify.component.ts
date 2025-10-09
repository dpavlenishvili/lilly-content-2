import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  inject,
  Inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { SpotifyService } from './spotify.service';
import { filter } from 'rxjs/operators';
import { MediaContentService } from '../media-content.service';
import { AudioAnalyticsEvent } from '../audio-analytics-event.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lilly-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SpotifyComponent implements OnInit, AfterViewInit {
  readonly backgroundColor = input<string>('#de3626');

  @HostBinding('style.background-color')
  get backgroundColorStyle(): string {
    return this.backgroundColor();
  }

  readonly entryId = input<string>();
  readonly height = input<string>('152');
  readonly title = input<string>();
  readonly subsiteName = input<string>();

  readonly spotifyPlayer = viewChild<ElementRef>('spotifyPlayer');
  private readonly currentAudioState = signal<AudioAnalyticsEvent | undefined>(undefined);
  private readonly destroyRef = inject(DestroyRef);

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
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(api => {
      const options = {
        uri: `spotify:episode:${this.entryId()}`,
        height: this.height(),
      };
      const callback = EmbedController => {
        EmbedController.addListener('playback_update', eventData => {
          const currentState = eventData.data.isPaused ? AudioAnalyticsEvent.Pause : AudioAnalyticsEvent.Play;

          if (currentState !== this.currentAudioState()) {
            this.currentAudioState.set(currentState);
            this.mediaContentAnalytics.sendMediaAnalytics(currentState, this.subsiteName(), this.title());
          }
        });
      };

      try {
        api.createController(this.spotifyPlayer()?.nativeElement, options, callback);
      } catch (e) {
        this.mediaContentAnalytics.sendMediaAnalytics(AudioAnalyticsEvent.Error, this.subsiteName(), this.title());
      }
    });
  }
}
