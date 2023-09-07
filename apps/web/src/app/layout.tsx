import '../styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Tuturuuu',
  description:
    'Brainstorm and organize your ideas at the speed of thought, supercharged by AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}