import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
declare const window;

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private readonly spotifyScriptId = 'spotifyLib';
  private spotifyIframeApi: BehaviorSubject<any> = new BehaviorSubject(null);
  public spotifyIframeApi$: Observable<any> = this.spotifyIframeApi.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) { }

  public loadSpotifyScript(): void {
    if (this.document.getElementById(this.spotifyScriptId)) {
      return;
    }

    const node = this.document.createElement('script');
    node.id = this.spotifyScriptId;
    node.src = '//open.spotify.com/embed/iframe-api/v1';
    node.type = 'text/javascript';
    node.async = true;

    window.onSpotifyIframeApiReady = iFrameAPI => {
      this.spotifyIframeApi.next(iFrameAPI);
    };

    this.document.getElementsByTagName('head')[0].appendChild(node);
  }
}
