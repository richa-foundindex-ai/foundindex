import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import WhyItMatters from "@/components/landing/WhyItMatters";
import HowItWorks from "@/components/landing/HowItWorks";
import ResearchFoundation from "@/components/landing/ResearchFoundation";
import FAQ from "@/components/landing/FAQ";
import ComingInV2 from "@/components/landing/ComingInV2";
import Footer from "@/components/landing/Footer";
import { FeedbackModal } from "@/components/results/FeedbackModal";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const Index = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyItMatters />
      <HowItWorks />
      <ResearchFoundation />
      <FAQ />
      <ComingInV2 />
      <Footer onOpenFeedback={() => setShowFeedbackModal(true)} />
      
      <FeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        isGeneralFeedback={true}
      />

      {/* Back to top button - shows after scrolling */}
      <Button onClick={scrollToTop} className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg" size="icon">
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Index;
