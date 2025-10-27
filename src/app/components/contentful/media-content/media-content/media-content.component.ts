import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { MediaContentType } from '../media-content-type.enum';
import { VideoComponent } from '../video/video.component';
import { KalturaComponent } from '../kaltura/kaltura.component';
import { YoutubeComponent } from '../youtube/youtube.component';

@Component({
  selector: 'lilly-media-content',
  templateUrl: './media-content.component.html',
  styleUrls: ['./media-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VideoComponent,
    KalturaComponent,
    YoutubeComponent
  ],
  standalone: true
})
export class MediaContentComponent {
  readonly mediaType = input<MediaContentType>();
  readonly mediaId = input<string>();
  readonly uiConfigId = input<string>();  // This one just for Kaltura
  readonly subsiteName = input<string>();
  readonly title = input<string>();
  readonly videoConfig = input<Record<string, never>>();
  readonly isPlaying = input<boolean>();

  readonly videoEnded = output<void>();

  public readonly isAutoplay = signal(false);
  public readonly isMuted = signal(true);
  public readonly isLoop = signal(true);

  readonly MediaContentType: typeof MediaContentType = MediaContentType;

  constructor() {
    effect(() => {
      const value = this.videoConfig();

      if (!value) return;

      if ('autoplay' in value) {
        this.isAutoplay.set(value.autoplay);
      }

      if ('mute' in value) {
        this.isMuted.set(value.mute);
      }

      if ('loop' in value) {
        this.isLoop.set(value.loop);
      }
    }, { allowSignalWrites: true });
  }

  onVideoEnded(): void {
    this.videoEnded.emit();
  }
}
