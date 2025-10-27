import { ChangeDetectionStrategy, Component, computed, effect, Inject, input, OnInit, output, viewChild } from '@angular/core';
import { YoutubeParams } from './youtube-params.interface';
import { MediaContentService } from '../media-content.service';
import { VideoAnalyticsEvent } from '../video-analytics-event.enum';
import { DOCUMENT } from '@angular/common';
import { YouTubePlayer } from '@angular/youtube-player';

const VideoState = {
  0: VideoAnalyticsEvent.ENDED,
  1: VideoAnalyticsEvent.PLAY,
  2: VideoAnalyticsEvent.PAUSE
};

export const YOUTUBE_SCRIPT_ID = 'youtube_script';
export const YOUTUBE_SCRIPT_URL = 'assets/scripts/youtube_iframe_api.js';

@Component({
  selector: 'lilly-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    YouTubePlayer
  ],
  standalone: true
})
export class YoutubeComponent implements OnInit {
  readonly isPlaying = input<boolean>(false);
  readonly isMuted = input<boolean>(true);
  readonly isLoop = input<boolean>(true);
  readonly title = input<string>();
  readonly subsiteName = input<string>();
  readonly youtubeId = input<string>();
  readonly isAutoplay = input<boolean>(false);

  readonly ended = output<void>();

  readonly youtubePlayer = viewChild<YouTubePlayer>('youtubePlayer');

  readonly videoParams = computed<YoutubeParams>(() => {
    return {
      playlist: this.youtubeId(),
      loop: this.isLoop(),
      mute: this.isMuted(),
      autoplay: false,
    };
  });

  constructor(
    private mediaContentAnalytics: MediaContentService,
    @Inject(DOCUMENT) private document: Document
  ) {
    effect(() => {
      const player = this.youtubePlayer();
      const shouldPlay = this.isPlaying();

      if (!player) return;

      if (shouldPlay) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    });
  }

  public ngOnInit(): void {
    this.optionalLoadScript();
  }

  public optionalLoadScript(): void {
    if (this.document.getElementById(YOUTUBE_SCRIPT_ID)) {
      return;
    }
    const element = this.document.createElement('script');
    element.src = YOUTUBE_SCRIPT_URL;
    element.id = YOUTUBE_SCRIPT_ID;
    this.document.head.appendChild(element);
  }

  public sendAnalytic(videoState: { data: number }): void {
    const analysedState = VideoState[videoState.data];

    if (analysedState === VideoAnalyticsEvent.ENDED) {
      this.ended.emit();
    }

    if (analysedState) {
      this.mediaContentAnalytics.sendMediaAnalytics(analysedState, this.subsiteName(), this.title());
    }
  }

  public handleError(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName(), this.title());
  }

  public onPlayerReady(): void {
    const player = this.youtubePlayer();
    if (player && this.isPlaying()) {
      player.playVideo();
    }
  }
}
