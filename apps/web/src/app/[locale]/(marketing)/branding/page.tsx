import type { Metadata } from 'next';
import BrandingContent from './client';

export const metadata: Metadata = {
  title: 'Branding',
  description:
    'Explore the official branding assets of Neo Culture Tech. Our visual identity represents our mission, culture, and community.',
  keywords: 'branding, logo, design, assets, identity, Neo Culture Tech, NCT',
};

export default function BrandingPage() {
  return <BrandingContent />;
}
