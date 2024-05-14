import { ReactNode } from 'react';

import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/constants/configs';
import { StaffToolbar } from './staff-toolbar';
import NavbarPadding from './navbar-padding';
import { Metadata } from 'next';
import Navbar from './navbar';
import Head from 'next/head';

export const dynamic = 'force-dynamic';

interface Props {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export async function generateMetadata({
  params: { lang },
}: Props): Promise<Metadata> {
  const enDescription = 'Take control of your workflow, supercharged by AI.';
  const viDescription = 'Quản lý công việc của bạn, siêu tốc độ cùng AI.';

  const description = lang === 'vi' ? viDescription : enDescription;

  return {
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    metadataBase: new URL(siteConfig.url),
    description,
    keywords: [
      'Next.js',
      'React',
      'Tailwind CSS',
      'Server Components',
      'Radix UI',
    ],
    authors: [
      {
        name: 'vohoangphuc',
        url: 'https://www.vohoangphuc.com',
      },
    ],
    creator: 'vohoangphuc',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description,
      images: [siteConfig.ogImage],
      creator: '@tutur3u',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: `/site.webmanifest`,
  };
}

export default async function RootLayout({
  children,
  params: { lang },
}: Props) {
  return (
    <Head>
      <html lang={lang} />
      <Providers
        attribute="class"
        defaultTheme="dark"
        themes={[
          'system',

          'light',
          'light-pink',
          'light-purple',
          'light-yellow',
          'light-orange',
          'light-green',
          'light-blue',

          'dark',
          'dark-pink',
          'dark-purple',
          'dark-yellow',
          'dark-orange',
          'dark-green',
          'dark-blue',
        ]}
        enableColorScheme={false}
        enableSystem
      >
        <Navbar />
        <NavbarPadding>{children}</NavbarPadding>
      </Providers>
      <TailwindIndicator />
      <StaffToolbar />
      <Toaster />
    </Head>
  );
}
