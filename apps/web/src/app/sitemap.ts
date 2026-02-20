import type { MetadataRoute } from 'next';
import { BASE_URL, PUBLIC_PATHS } from '@/constants/common';

export default function sitemap(): MetadataRoute.Sitemap {
  const langSlugs = ['', 'en', 'vi']; // Add more language slugs as needed

  // Generate URLs for both English and Vietnamese
  const urls: MetadataRoute.Sitemap = [];

  // Non-language-specific routes
  PUBLIC_PATHS.forEach((route, index) => {
    langSlugs.forEach((lang) => {
      urls.push({
        url: `${BASE_URL}${lang}${route}`,
        lastModified: new Date(),
        priority: index === 0 ? 1.0 : 0.8,
      });
    });
  });

  return urls;
}
