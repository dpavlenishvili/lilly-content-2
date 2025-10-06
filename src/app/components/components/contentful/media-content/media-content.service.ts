import { Injectable } from '@angular/core';
import { VideoAnalyticsEvent } from './video-analytics-event.enum';
import { AnalyticsService } from '@careboxhealth/core';
import { AudioAnalyticsEvent } from './audio-analytics-event.enum';
import { MediaContentType } from './media-content-type.enum';

@Injectable({
  providedIn: 'root'
})
export class MediaContentService {

  constructor(private analyticsService: AnalyticsService) { }

  public sendMediaAnalytics(action: VideoAnalyticsEvent | AudioAnalyticsEvent, subsiteName: string, title: string): void {
    const entries = {
      action,
      subsiteName,
      title
    };
    this.analyticsService.write(entries);
  }

  public getMediaIdByMediaType(widgetFields): string {
    switch (widgetFields?.displayMedia) {
    case MediaContentType.VIDEO:
      return widgetFields.videoUrl || widgetFields.video;

    case MediaContentType.KALTURA:
      return widgetFields.kalturaId || widgetFields.cardVideoId;

    case MediaContentType.YOUTUBE:
      return widgetFields.youtubeId;

    case MediaContentType.SPOTIFY:
      return widgetFields.spotifyId;
    }
  }
}
