import HeroSection from "@/components/landing/HeroSection";
import WhyItMatters from "@/components/landing/WhyItMatters";
import HowItWorks from "@/components/landing/HowItWorks";
import BetaTransparency from "@/components/landing/BetaTransparency";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyItMatters />
      <HowItWorks />
      <BetaTransparency />
      <FinalCTA />
    </div>
  );
};

export default Index;
