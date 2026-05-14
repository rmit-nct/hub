import '@ncthub/ui/globals.css';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEO Link Shortener',
  description:
    'Shorten your links with NEO Link Shortener, the best link shortener.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
