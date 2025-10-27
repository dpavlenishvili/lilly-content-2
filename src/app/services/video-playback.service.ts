import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service to coordinate video playback across the application.
 * Ensures only one video plays at a time.
 */
@Injectable({
  providedIn: 'root'
})
export class VideoPlaybackService {
  private currentlyPlayingId$ = new BehaviorSubject<string | null>(null);

  /**
   * Register a video as currently playing.
   * This will automatically pause any other playing video.
   * @param videoId Unique identifier for the video
   */
  registerPlaying(videoId: string): void {
    const currentId = this.currentlyPlayingId$.value;
    if (currentId !== videoId) {
      this.currentlyPlayingId$.next(videoId);
    }
  }

  /**
   * Unregister the currently playing video.
   * @param videoId Unique identifier for the video
   */
  unregisterPlaying(videoId: string): void {
    if (this.currentlyPlayingId$.value === videoId) {
      this.currentlyPlayingId$.next(null);
    }
  }

  /**
   * Check if a specific video should be playing.
   * Returns an observable that emits true when this video should play,
   * false when it should pause.
   * @param videoId Unique identifier for the video
   */
  shouldPlay(videoId: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const subscription = this.currentlyPlayingId$.subscribe(currentId => {
        observer.next(currentId === videoId);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get the currently playing video ID.
   */
  getCurrentlyPlayingId(): string | null {
    return this.currentlyPlayingId$.value;
  }
}