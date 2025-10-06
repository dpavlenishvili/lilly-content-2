import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { YoutubeParams } from './youtube-params.interface';
import { MediaContentService } from '../media-content.service';
import { VideoAnalyticsEvent } from '../video-analytics-event.enum';
import { DOCUMENT } from '@angular/common';
import { YouTubePlayer } from '@angular/youtube-player';

const VideoState = {
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
  @Input() public isAutoplay = false;
  @Input() public isMuted = true;
  @Input() public isLoop = true;
  @Input() public title: string;
  @Input() private subsiteName: string;
  @Input() public set youtubeId(id: string) {
    this.videoId = id;
    this.setVideoParams();
  }

  public get youtubeId(): string {
    return this.videoId;
  }

  public videoParams: YoutubeParams;
  private videoId: string;

  constructor(
    private mediaContentAnalytics: MediaContentService,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  public ngOnInit(): void {
    this.optionalLoadScript();
    this.setVideoParams();
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

    if (analysedState) {
      this.mediaContentAnalytics.sendMediaAnalytics(analysedState, this.subsiteName, this.title);
    }
  }

  public handleError(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName, this.title);
  }

  private setVideoParams(): void {
    this.videoParams = {
      playlist: this.youtubeId,
      loop: this.isLoop,
      mute: this.isMuted,
      autoplay: this.isAutoplay,
    };
  }
}
