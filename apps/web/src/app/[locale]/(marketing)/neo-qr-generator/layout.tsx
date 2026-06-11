import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neo QR Generator | RMIT Technology Club',
  description:
    'Generate custom QR codes for URLs, WiFi, and more. Built for RMIT engineering and IT students (sinh vien). A great tool for Uni/college projects spanning software engineering (SE - Ky thuat phan mem), hardware, and Robotic technology.',
  keywords: ['rmit', 'RMIT', 'engineering', 'IT', 'software engineering'],
};

export default function NeoQrGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
