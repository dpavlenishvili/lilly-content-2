import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IVideoCard } from '../../models/contentful';
import { MediaContentComponent } from '../../media-content/media-content/media-content.component';
import { MediaContentType } from '../../media-content/media-content-type.enum';
import {MatButtonModule} from '@angular/material/button';
import {CbCardModule} from '../../../../shared-features/ui/components/cb-card/src/app/shared/card';
import {CbTagComponent} from '../../../../shared-features/ui/components/cb-tag/cb-tag.component';
import {CbPropComponent} from '../../../../shared-features/ui/components/cb-prop/cb-prop.component';
import { VideoPlaybackService } from '../../../../services/video-playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Video state can be one of three values:
 * - 'thumbnail': Video hasn't started yet or has ended, showing thumbnail
 * - 'playing': Video is currently playing
 * - 'paused': Video is paused but player remains visible
 */
export type VideoState = 'thumbnail' | 'playing' | 'paused';

@Component({
  selector: 'lilly-video-card',
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, MediaContentComponent, MatButtonModule, CbCardModule, CbTagComponent, CbPropComponent],
})
export class VideoCardComponent implements OnInit {
  readonly video = input.required<IVideoCard>();

  private readonly videoPlaybackService = inject(VideoPlaybackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly videoState = signal<VideoState>('thumbnail');

  readonly playVideoLabel = $localize`:@@video_card.play_video_arialabel:Play video`;
  readonly pauseVideoLabel = $localize`:@@video_card.pause_video_arialabel:Pause video`;

  readonly mediaId = computed(() => {
    const videoConfig = this.video()?.fields?.video;
    if (!videoConfig) return '';

    const displayMedia = videoConfig.fields?.displayMedia;

    switch (displayMedia) {
    case MediaContentType.KALTURA:
      return videoConfig.fields?.kalturaId || '';
    case MediaContentType.YOUTUBE:
      return videoConfig.fields?.youtubeId || '';
    case MediaContentType.VIDEO:
      return videoConfig.fields?.videoUrl || '';
    default:
      return '';
    }
  });

  readonly uiConfigId = computed(() => {
    const kalturaConfigs = this.video()?.fields?.video?.fields?.kalturaUiConfig;
    return kalturaConfigs?.[0]?.fields?.id || '';
  });

  readonly isPlaying = computed(() => this.videoState() === 'playing');
  readonly showThumbnail = computed(() => this.videoState() === 'thumbnail');
  private readonly videoId = computed(() => {
    const video = this.video();
    return `${video?.sys?.id}_${this.mediaId()}`;
  });

  ngOnInit(): void {
    this.videoPlaybackService.shouldPlay(this.videoId()).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(shouldPlay => {
      const currentState = this.videoState();

      // If another video started playing and this one is playing, STOP it (reset to thumbnail)
      // This is different from user clicking pause - when switching videos, we fully reset
      if (!shouldPlay && currentState === 'playing') {
        this.videoState.set('thumbnail');
      }
    });
  }

  togglePlay(event: Event): void {
    event.stopPropagation();
    const currentState = this.videoState();

    switch (currentState) {
    case 'thumbnail':
      this.videoState.set('playing');
      this.videoPlaybackService.registerPlaying(this.videoId());
      break;
    case 'playing':
      this.videoState.set('paused');
      this.videoPlaybackService.unregisterPlaying(this.videoId());
      break;
    case 'paused':
      this.videoState.set('playing');
      this.videoPlaybackService.registerPlaying(this.videoId());
      break;
    }
  }

  onVideoEnded(): void {
    this.videoState.set('thumbnail');
    this.videoPlaybackService.unregisterPlaying(this.videoId());
  }
}
