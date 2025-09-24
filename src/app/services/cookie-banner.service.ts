import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CookieBannerService {
  public showCookieBanner: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
