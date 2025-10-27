import { Environment } from '../app/enums/environment.enum';
import { EnvironmentConfig } from '../app/interfaces/environment-config.interface';

export const environment: EnvironmentConfig = {
  environment: Environment.STAGING,
  production: true,
  apiUrl: '',
  GoogleAnalyticsTrackerId: 'UA-162481654-15',
  GoogleTagManagerTrackerId: 'GTM-N76Z653',
  contentfulSpaceId: 'pixe68huo2dd',
  contentfulEnvironment: 'content',
  contentfulAccessToken: 'orzg0E_06pk0sYLJnxfvxHiMPbva9okOMu6BhKvvl4I',
  contentfulHostUrl: 'preview.contentful.com',
  locales: ['en-US', 'es-US', 'cs-CZ'],
};
