import Events from './events';
import HeroSection from './hero-section';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhatWeDo from './what-we-do';
import WhyUs from './why-us';

export default function MarketingPage() {
  return (
    <>
      <LandingIntro />
      <HeroSection />
      <WhatWeDo />
      <div className="container mx-auto flex flex-col items-center gap-6 px-8 py-16">
        <Events />
        <WhyUs />
        <SummarizedDepartments />
      </div>
    </>
  );
}
