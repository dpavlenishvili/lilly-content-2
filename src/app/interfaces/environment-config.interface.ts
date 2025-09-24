import { Environment } from '../enums/environment.enum';

export interface EnvironmentConfig {
  environment: Environment;
  production: boolean;
  apiUrl: string;
  GoogleAnalyticsTrackerId: string;
  GoogleTagManagerTrackerId: string;
  contentfulSpaceId: string;
  contentfulEnvironment: string;
  contentfulAccessToken: string;
  contentfulHostUrl: string;
  locales: string[];
}
