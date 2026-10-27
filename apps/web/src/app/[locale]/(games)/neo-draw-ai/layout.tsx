import type { Metadata, Viewport } from 'next';
import { Permanent_Marker } from 'next/font/google';
import type React from 'react';
import './neo-draw-ai.css';

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEO DrawAI',
  description:
    'Draw with your mouse, your finger, or a pinch of your hand in front of the webcam — and race the clock while an AI tries to guess your doodle. Built by Neo Culture Tech.',
};

export const viewport: Viewport = {
  themeColor: '#0B1120',
  // The canvas handles its own gestures; page-level pinch-zoom would fight it.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function NeoDrawAILayout({ children }: LayoutProps) {
  return (
    <div className={`nct-drawai ${permanentMarker.variable} antialiased`}>
      {children}
    </div>
  );
}
