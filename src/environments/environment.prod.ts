import { EnvironmentConfig } from '../app/interfaces/environment-config.interface';
import { Environment } from '../app/enums/environment.enum';

export const environment: EnvironmentConfig = {
  environment: Environment.PRODUCTION,
  production: true,
  apiUrl: '',
  GoogleAnalyticsTrackerId: 'UA-162481654-14',
  GoogleTagManagerTrackerId: 'GTM-W55WFQ9',
  contentfulSpaceId: 'tkom1vk0n4w2',
  contentfulEnvironment: 'content',
  contentfulAccessToken: 'FmP-TboO_Tr2RYF-D9Az7KkE-SOgjvd9jJTse6I8x40',
  contentfulHostUrl: 'contentful.careboxhealth.com',
  locales: ['en-US'],
};
