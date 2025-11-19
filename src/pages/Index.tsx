import HeroSection from "@/components/landing/HeroSection";
import WhyItMatters from "@/components/landing/WhyItMatters";
import Methodology from "@/components/landing/Methodology";
import BenchmarkDatabase from "@/components/landing/BenchmarkDatabase";
import WhatYouGet from "@/components/landing/WhatYouGet";
import HowItWorks from "@/components/landing/HowItWorks";
import TrackingSection from "@/components/landing/TrackingSection";
import SocialProof from "@/components/landing/SocialProof";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyItMatters />
      <Methodology />
      <BenchmarkDatabase />
      <WhatYouGet />
      <HowItWorks />
      <TrackingSection />
      <SocialProof />
      <FAQ />
      <FinalCTA />
    </div>
  );
};

export default Index;
