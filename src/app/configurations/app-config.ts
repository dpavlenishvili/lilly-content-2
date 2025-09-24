// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configuration: Record<string, any> = {
  accessGroupCode: 'LILLY21',
  appSource: 'lilly',
  partnerModules: 'LILLY21',
  applicationCode: 'lilly21',
  privacyProtection: 'GDPR',
  tollFreePhone: '1-844-901-0340',
  defaultCountry: 'GLOBAL',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setConfiguration(config: Record<string, any>) {
  if (!config) {
    return;
  }

  Object.keys(config).forEach(key => configuration[key] = config[key]);
}
