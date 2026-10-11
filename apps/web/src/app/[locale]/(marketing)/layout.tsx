import type React from 'react';
import Footer from '@/components/layouts/Footer';
import SiteBackground from '@/components/layouts/SiteBackground';
import Navbar from '../navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <SiteBackground />
      <Navbar hideMetadata />
      <div id="main-content" className="flex flex-col pt-16">
        {children}
      </div>
      <Footer />
    </>
  );
}
