import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MediaContentType } from '../media-content-type.enum';
import { VideoComponent } from '../video/video.component';
import { KalturaComponent } from '../kaltura/kaltura.component';
import { YoutubeComponent } from '../youtube/youtube.component';
import { SpotifyComponent } from '../spotify/spotify.component';

@Component({
  selector: 'lilly-media-content',
  templateUrl: './media-content.component.html',
  styleUrls: ['./media-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VideoComponent,
    KalturaComponent,
    YoutubeComponent,
    SpotifyComponent
  ],
  standalone: true
})
export class MediaContentComponent {
  @Input() public mediaType: MediaContentType;
  @Input() public mediaId: string;
  @Input() public uiConfigId: string;  // This one just for Kaltura
  @Input() public subsiteName: string;
  @Input() public title: string;
  @Input() public backgroundColor = '#de3626'; // This one just for Spotify
  @Input()
  set videoConfig(value: Record<string, any>) {
    if (!value) return;

    if ('autoplay' in value) {
      this.isAutoplay = value.autoplay;
    }

    if ('mute' in value) {
      this.isMuted = value.mute;
    }

    if ('loop' in value) {
      this.isLoop = value.loop;
    }
  }

  public isAutoplay = false;
  public isMuted = true;
  public isLoop = true;

  readonly MediaContentType: typeof MediaContentType = MediaContentType;
}
