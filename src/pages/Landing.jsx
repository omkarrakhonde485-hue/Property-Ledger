import AnimatedBackground from '@/components/landing/AnimatedBackground';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ExperienceSection from '@/components/landing/ExperienceSection';
import HowItWorks from '@/components/landing/HowItWorks';
import DashboardPreview from '@/components/landing/DashboardPreview';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import Testimonials from '@/components/landing/Testimonials';
import Statistics from '@/components/landing/Statistics';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const handleLoginClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <LandingNavbar onLoginClick={handleLoginClick} />
      <main>
        <HeroSection onLoginClick={handleLoginClick} />
        <FeaturesSection />
        <ExperienceSection />
        <HowItWorks />
        <DashboardPreview />
        <WhyChooseUs />
        <Testimonials />
        <Statistics />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}