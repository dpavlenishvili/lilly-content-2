import { countries } from './countries.config';

export const configuration = {
  // In practise, currentLang means currentCountry, for example the Great Britain has "gb" in the currentLang.
  // But "en" means USA. And we have to use it, even if it seems strange
  currentLang: 'en',
  defaultCultureCode: 'es-US',
  defaultLanguageLCID: 'es-US',
  privacyProtection: 'USA',
  languages: [{
    code: 'es-US',
    LCID: 'es-US',
    title: 'Spanish (USA)'
  }],
  countries
};
