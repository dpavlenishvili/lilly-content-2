import { LanguageCode } from '@careboxhealth/core';
import { externalRoutes as linksEnUs } from './links.en-us';
import { externalRoutes as linksEsUs } from './links.es-us';


export const linksAll = {
  [LanguageCode.en_US]: linksEnUs,
  [LanguageCode.es_US]: linksEsUs,
};
