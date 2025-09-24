import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LillyHeaderComponent } from './components/header/header.component';
import { LocalFooterComponent } from './components/footer/footer.component';
import { CookiesBannerComponent } from './components/cookies-banner/cookies-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LillyHeaderComponent, LocalFooterComponent, CookiesBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {

}
