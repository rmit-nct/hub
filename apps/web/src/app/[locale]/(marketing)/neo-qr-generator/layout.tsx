import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neo QR Generator | RMIT Technology Club',
  description:
    'Generate custom QR codes for URLs, WiFi, and more. Built for RMIT engineering and IT students (sinh vien). A great tool for Uni/college projects spanning software engineering (SE - Ky thuat phan mem), hardware, and Robotic technology.',
  keywords: [
    'rmit',
    'RMIT',
    'engineering',
    'IT',
    'software engineering',
    'SE',
    'Cong nghe Thong tin',
    'Ky thuat phan mem',
    'sinh vien',
    'Uni',
    'college',
    'hardware',
    'Robotic',
    'game',
    'game online',
    'pacman',
    'technology',
    'club',
    'soli work',
    'Visual studio code',
    'coder',
    'vibe code',
    'github',
    'app',
    'tailwind',
    'java',
    'c++',
    'python',
    'javascript',
  ],
};

export default function NeoQrGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
