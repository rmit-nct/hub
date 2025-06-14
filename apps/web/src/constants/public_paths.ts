import { supportedLocales } from '@/i18n/routing';

export const APP_PUBLIC_PATHS = [
  '/home',
  '/login',
  '/about',
  '/projects',
  '/neo-crush',
  '/neo-chess',
  '/meet-together',
].reduce((acc: string[], path) => {
  // Add the original path
  acc.push(path);

  // Add localized paths
  const localizedPaths = supportedLocales.map((locale) => `/${locale}${path}`);
  acc.push(...localizedPaths);

  return acc;
}, []);
