import { LanguageCode } from '@careboxhealth/core';
import { configuration as configurationEnUs } from './app-en-us.config';
import { configuration as configurationEsUs } from './app-es-us.config';

export const appAllConfigs = {
  [LanguageCode.en_US]: configurationEnUs,
  [LanguageCode.es_US]: configurationEsUs,
};
