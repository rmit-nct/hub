import { DEV_MODE } from './common';

export const siteConfig = {
  name: 'Neo Culture Tech',
  url: DEV_MODE ? 'http://localhost:7803' : 'https://rmitnct.club',
  ogImage: DEV_MODE
    ? 'http://localhost:7803/media/logos/og-image.png'
    : 'https://rmitnct.club/media/logos/og-image.png',
  links: {
    twitter: 'https://twitter.com/tutur3u',
    github: 'https://github.com/tutur3u/platform',
  },
};

export type SiteConfig = typeof siteConfig;
