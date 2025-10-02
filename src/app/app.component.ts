import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigurationProvider } from '@careboxhealth/core';
import { LillyHeaderComponent } from './components/header/header.component';
import { LocalFooterComponent } from './components/footer/footer.component';
import { CookiesBannerComponent } from './components/cookies-banner/cookies-banner.component';
import { HelperService } from './services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import { LinkTarget } from '@careboxhealth/layout1-shared';
import {
  ANALYTICS_OBJ_ATTRIBUTE,
  MD_TO_HTML_PIPE_LINK_CLASS,
  MD_TO_HTML_PIPE_LINK_DATA_ATTRIBUTE,
  MD_TO_HTML_PIPE_STRONG_CLASS
} from './pipes/md-to-html.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LillyHeaderComponent, LocalFooterComponent, CookiesBannerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Inject required services
  private readonly configuration: ConfigurationProvider = inject(ConfigurationProvider);
  private readonly helperService: HelperService = inject(HelperService);

  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    if (event.target instanceof HTMLAnchorElement) {
      const element = event.target as HTMLAnchorElement;
      let href = element?.getAttribute('href');
      if (element.className.includes(MD_TO_HTML_PIPE_LINK_CLASS)) {
        const hrefParts = href.split('/');
        const countryCode: string =  this.configuration.defaultCultureCode;

        if (hrefParts[0] === '' && hrefParts[1]?.toLowerCase() === countryCode.toLowerCase()) {
          href = '/' + hrefParts.slice(2, hrefParts.length).join('/');
        }
        event.preventDefault();
        const linkBehavior = element?.getAttribute(MD_TO_HTML_PIPE_LINK_DATA_ATTRIBUTE);

        let analyticsObj: {[key: string]: unknown} | undefined;
        const analyticsAttr = element?.getAttribute(ANALYTICS_OBJ_ATTRIBUTE);
        if (analyticsAttr && Object.keys(JSON.parse(analyticsAttr) || {}).length) {
          analyticsObj = { ...JSON.parse(analyticsAttr), linkUrl: href, linkText: element.textContent };
        }
        this.helperService.goToLink(href, linkBehavior as LinkBehavior, analyticsObj);
      } else if (href && !event.defaultPrevented && this.helperService.shouldOpenLeavingCountryPopup(href)) {
        event.preventDefault();
        this.helperService.openDialog(href, element.target as LinkTarget || LinkTarget.Self);
      }
    }

    if (event.target instanceof HTMLSpanElement) {
      const element = event.target as HTMLSpanElement;
      if (element.className.includes(MD_TO_HTML_PIPE_STRONG_CLASS)) {
        element.children[0].className = element.children[0].className === 'd-none' ? 'd-inline' : 'd-none';
      }
    }
  }
}
