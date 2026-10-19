import Events from './events';
import HeroSection from './hero-section';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhoWeAre from './who-we-are';
import WhyUs from './why-us';

// Visible separator between sections: a gradient rule with a centered brand mark.
function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="container mx-auto flex items-center gap-4 px-6 py-6 sm:px-8"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      <div className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-brand-light-blue shadow-[0_0_12px] shadow-brand-light-blue/40" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  );
}

export default function MarketingPage() {
  return (
    <>
      <LandingIntro />
      <HeroSection />
      <WhoWeAre />
      <SectionDivider />
      <Events />
      <SectionDivider />
      <SummarizedDepartments />
      <SectionDivider />
      <WhyUs />
    </>
  );
}
