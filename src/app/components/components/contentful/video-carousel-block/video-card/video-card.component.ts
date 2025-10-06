import { ChangeDetectionStrategy, Component, computed, input, signal, } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IVideoCard } from '../../models/contentful';
import { MediaContentComponent } from '../../media-content/media-content/media-content.component';
import { MediaContentType } from '../../media-content/media-content-type.enum';

@Component({
  selector: 'lilly-video-card',
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, MediaContentComponent],
})
export class VideoCardComponent {
  readonly video = input.required<IVideoCard>();

  readonly isPlaying = signal(false);

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

  togglePlay(event: Event): void {
    event.stopPropagation();
    this.isPlaying.update(playing => !playing);
  }
}
