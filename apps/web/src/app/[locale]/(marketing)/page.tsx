import Events from './events';
import HeroSection from './hero-section';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhoWeAre from './who-we-are';
import WhyUs from './why-us';

// Spacing, type and container widths are rem-based, so scaling the root font
// grows the whole landing page on large monitors instead of leaving wide margins.
const LARGE_SCREEN_CSS = `
@media (min-width: 2560px) { html { font-size: 150%; } }
@media (min-width: 3840px) { html { font-size: 225%; } }
`;

// Visible separator between sections: a gradient rule with a centered brand mark.
function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="container mx-auto flex items-center gap-4 px-6 py-6 sm:px-8"
    >
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-border" />
      <div className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-brand-light-blue shadow-[0_0_12px] shadow-brand-light-blue/40" />
      <div className="h-px flex-1 bg-linear-to-l from-transparent via-border to-border" />
    </div>
  );
}

export default function MarketingPage() {
  return (
    <>
      <style>{LARGE_SCREEN_CSS}</style>
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
