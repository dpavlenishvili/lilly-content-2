import { environment } from './environments/environment';
import { Environment } from './app/enums/environment.enum';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { configuration } from './app/configurations/app-config';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, HammerModule, bootstrapApplication } from '@angular/platform-browser';
import {
  COOKIE_PERMISSION_NAME_FIELD,
  GTM_GOOGLE_CONSENT_MODE_CONFIGURED,
  CoreModule,
  SelectiveWithDelayPreloadingStrategy
} from '@careboxhealth/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { routes } from './app/app.routes';

export const getBaseUrl = (document: Document): string => {
  return document.getElementsByTagName('base')[0].href;
};

export function bootstrap(): Promise<void>  {
  return bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
      // Angular Modules
        CommonModule, BrowserModule,
        // CareBox Modules
        CoreModule.forRoot([environment, configuration]),
        HammerModule
      ),
      { provide: COOKIE_PERMISSION_NAME_FIELD, useValue: 'lt-cookie-settings' },
      { provide: GTM_GOOGLE_CONSENT_MODE_CONFIGURED, useValue: true },
      { provide: 'BASE_HREF', useFactory: getBaseUrl, deps: [DOCUMENT] },
      provideRouter(
        routes,
        withPreloading(SelectiveWithDelayPreloadingStrategy),
        withInMemoryScrolling({
          anchorScrolling: 'enabled',
          scrollPositionRestoration: 'top'
        }),
      ),
      provideHttpClient(withInterceptorsFromDi()),
      provideAnimations()
    ]
  })
    .then(ref => {
      // Ensure Angular destroys itself on hot reloads.
      if (window?.['ngRef']) {
        window?.['ngRef'].destroy();
      }
      window['ngRef'] = ref;

      if (environment.environment !== Environment.PRODUCTION) {
        import('@careboxhealth/layout1-shared').then(({ LocalizationDebugWidgetComponent, mountLocalizationDebugWidget }) => {
          mountLocalizationDebugWidget(LocalizationDebugWidgetComponent, ref.injector);
        });
      }
      // Otherwise, log the boot error
    })
    .catch(err => console.error(err));
}
