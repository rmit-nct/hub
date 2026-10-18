import Events from './events';
import HeroSection from './hero-section';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhoWeAre from './who-we-are';
import WhyUs from './why-us';

export default function MarketingPage() {
  return (
    <>
      <LandingIntro />
      <HeroSection />
      <WhoWeAre />
      <Events />
      <SummarizedDepartments />
      <WhyUs />
    </>
  );
}
