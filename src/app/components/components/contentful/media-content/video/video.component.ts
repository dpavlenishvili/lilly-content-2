import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { VideoAnalyticsEvent } from '../video-analytics-event.enum';
import { MediaContentService } from '../media-content.service';
import { HelperService } from '../../../../services/helper.service';

@Component({
  selector: 'lilly-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class VideoComponent implements OnChanges {
  @Input() public videoUrl: string;
  @Input() public isAutoplay = false;
  @Input() public isMuted = true;
  @Input() public isLoop = true;
  @Input() public title: string;
  @Input() private subsiteName: string;

  public video: {isIframe: boolean, videoSrc: string | SafeResourceUrl};

  constructor(private mediaContentAnalytics: MediaContentService,
              private helperService: HelperService) {
  }

  get isVideoAutoplay(): '0' | '1' {
    return this.isAutoplay ? '1' : '0';
  }

  public ngOnChanges(): void {
    console.count(this.videoUrl);
    if (this.videoUrl) {
      // TODO This logic has to be removed after updating Contentful Prod.
      // TODO In this component we has to use only video html tag(not iframe), we cannot add analytics for random iframe
      this.video = this.helperService.setVideoSrc(this.videoUrl, this.isVideoAutoplay);
    }
  }

  public pause(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.PAUSE, this.subsiteName, this.title);
  }

  public play(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.PLAY, this.subsiteName, this.title);
  }

  public error(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName, this.title);
  }
}
