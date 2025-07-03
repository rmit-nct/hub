import { supportedLocales } from '@/i18n/routing';

export const APP_PUBLIC_PATHS = [
  '/',
  '/login',
  '/about',
  '/projects',
  '/meet-together',
  '/neo-crush',
  '/neo-chess',
].reduce((acc: string[], path) => {
  // Add the original path
  acc.push(path);

  // Add localized paths
  const localizedPaths = supportedLocales.map((locale) => `/${locale}${path}`);
  acc.push(...localizedPaths);

  return acc;
}, []);
