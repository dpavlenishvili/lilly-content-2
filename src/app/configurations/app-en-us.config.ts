import { countries } from './countries.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configuration: Record<string, any> = {
  currentLang: 'en',
  defaultCultureCode: 'en-US',
  defaultLanguageLCID: 'en-us',
  privacyProtection: 'USA',
  languages: [{
    code: 'en',
    LCID: 'en-us',
    title: 'English'
  }],
  countries
};

