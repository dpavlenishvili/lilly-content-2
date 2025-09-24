export const externalRoutes: Record<string, string> = {};

export function setLinks(links) {
  if (!links) {
    return;
  }

  Object.keys(links).forEach(key => externalRoutes[key] = links[key]);
}
