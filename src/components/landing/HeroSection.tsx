import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface HeroSectionProps {
  onTestClick: () => void;
}

const HeroSection = ({ onTestClick }: HeroSectionProps) => {
  return (
    <header className="container mx-auto px-4 py-16 md:py-24 text-center">
      <h1 className="text-[2rem] md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight px-2">
        Only 23% of Websites Are Structured for AI Discovery
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
        Most sites score below 60 because AI can't parse their structure. FoundIndex diagnoses WHY — in 60 seconds.
      </p>

      <Button
        size="lg"
        onClick={onTestClick}
        className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Test Your Site Free
      </Button>
      
      <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto px-4">
        No credit card required. See how ChatGPT, Perplexity, and Claude see your website.
      </p>

      <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-success" />
          10,000+ sites tested
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-success" />
          Used by marketers at 50+ companies
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-success" />
          AI visibility scores updated daily
        </span>
      </div>
    </header>
  );
};

export default HeroSection;
