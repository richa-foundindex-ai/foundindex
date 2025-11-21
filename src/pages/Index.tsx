import HeroSection from "@/components/landing/HeroSection";
import WhyItMatters from "@/components/landing/WhyItMatters";
import FAQ from "@/components/landing/FAQ";
import ComingInV2 from "@/components/landing/ComingInV2";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyItMatters />
      <FAQ />
      <ComingInV2 />
      <Footer />
    </div>
  );
};

export default Index;
