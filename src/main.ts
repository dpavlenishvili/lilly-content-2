import { enableProdMode } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { environment } from './environments/environment';
import { configuration, setConfiguration } from './app/configurations/app-config';
import {
  getCurrentLanguage,
  getRevisionCode,
  getTranslations,
  RevisionResponse,
  Translations,
  TRANSLATIONS_SESSION_KEY
} from '@careboxhealth/core';
import { appAllConfigs } from './app/configurations/app-all-configs';
import { applyWidgetTranslations } from '@careboxhealth/layout1-shared';
import { Environment } from './app/enums/environment.enum';

if (environment.production) {
  enableProdMode();
}

const currentLanguage: string = getCurrentLanguage()?.replace('_', '-');

// Set app configuration which is based on the current language
setConfiguration(appAllConfigs[currentLanguage]);


// Initialize translations
// The translations will be loaded from the server side and stored in the session storage
// If the translations are already in the session storage, we will check current revision to understand if it is changed.
// If it is changed, we will get the translations from the server side
// otherwise we will use the translations from the session storage to reduce application loading time.
void initTranslations();

async function initTranslations(): Promise<void> {
  const revisionResponse: RevisionResponse = await getRevisionCode(configuration);
  const language: string = getCurrentLanguage();
  const localStorageKey: string = `${configuration.accessGroupCode}_${TRANSLATIONS_SESSION_KEY}_${language}`;
  const translationsFromSessionStorage: Translations = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
  if (translationsFromSessionStorage?.revision === revisionResponse.revision
    && translationsFromSessionStorage.language === language
    && translationsFromSessionStorage.updated_at === revisionResponse.updated_at) {
    loadTranslations(getProcessedTranslations(translationsFromSessionStorage.translations));
    bootstrap();
    return;
  }

  const translations: Record<string, string> = await getTranslations(configuration, language);
  localStorage.setItem(localStorageKey, JSON.stringify({
    revision: revisionResponse.revision,
    updated_at: revisionResponse.updated_at,
    translations,
    language
  }));
  loadTranslations(getProcessedTranslations(translations));
  bootstrap();
}

function getProcessedTranslations(translations: Record<string, string>): Record<string, string> {
  return environment.environment !== Environment.PRODUCTION ? applyWidgetTranslations(translations) : translations;
}

export function bootstrap(): void {
  import('./bootstrap').then(m => m.bootstrap());
}

