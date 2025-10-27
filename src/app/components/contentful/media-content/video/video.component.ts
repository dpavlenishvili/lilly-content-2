import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, viewChild, ElementRef } from '@angular/core';
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
export class VideoComponent {
  readonly videoUrl = input<string>();
  readonly isAutoplay = input<boolean>(false);
  readonly isPlaying = input<boolean>(false);
  readonly isMuted = input<boolean>(true);
  readonly isLoop = input<boolean>(true);
  readonly title = input<string>();
  readonly subsiteName = input<string>();

  readonly ended = output<void>();

  readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoElement');

  readonly video = signal<{isIframe: boolean, videoSrc: string | SafeResourceUrl} | undefined>(undefined);

  readonly isVideoAutoplay = computed<'0' | '1'>(() => {
    return this.isAutoplay() ? '1' : '0';
  });

  constructor(private mediaContentAnalytics: MediaContentService,
              private helperService: HelperService) {
    effect(() => {
      const url = this.videoUrl();
      if (url) {
        // TODO This logic has to be removed after updating Contentful Prod.
        // TODO In this component we has to use only video html tag(not iframe), we cannot add analytics for random iframe
        this.video.set(this.helperService.setVideoSrc(url, this.isVideoAutoplay()));
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const video = this.videoElement()?.nativeElement;
      const shouldPlay = this.isPlaying();
      if (!video) return;

      if (shouldPlay) {
        video.play().catch(() => {
          // Handle autoplay failures silently
        });
      } else {
        video.pause();
      }
    });
  }

  public pause(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.PAUSE, this.subsiteName(), this.title());
  }

  public play(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.PLAY, this.subsiteName(), this.title());
  }

  public error(): void {
    this.mediaContentAnalytics.sendMediaAnalytics(VideoAnalyticsEvent.ERROR, this.subsiteName(), this.title());
  }

  public onEnded(): void {
    this.ended.emit();
  }
}
