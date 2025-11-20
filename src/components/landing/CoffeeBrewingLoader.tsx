import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
}

const STAGES = [
  { threshold: 0, label: "Setting up...", description: "Preparing your test" },
  { threshold: 15, label: "Analyzing website...", description: "Understanding your business" },
  { threshold: 30, label: "Generating queries...", description: "Creating buyer questions" },
  { threshold: 50, label: "Testing AI engines...", description: "Querying ChatGPT, Claude, Perplexity" },
  { threshold: 75, label: "Calculating scores...", description: "Computing your FoundIndex" },
  { threshold: 90, label: "Almost done...", description: "Finalizing results" },
];

export const CoffeeBrewingLoader = ({ onComplete }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const warningTimeout = setTimeout(() => setShowWarning(true), 60000);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.67;
        if (next >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(warningTimeout);
    };
  }, [onComplete]);

  const currentStage = STAGES.slice().reverse().find(stage => progress >= stage.threshold) || STAGES[0];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {showWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Still brewing your perfect FoundIndex...</p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">This can take up to 2 minutes. Please don't close this window!</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Brewing Your Results ☕</h2>
          <p className="text-muted-foreground">Analyzing your website's AI-readiness...</p>
        </div>

        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          {/* Steam wisps */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-12 rounded-full bg-gradient-to-t from-muted-foreground/30 to-transparent animate-steam"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s',
                }}
              />
            ))}
          </div>

          {/* Coffee cup */}
          <div className="relative">
            {/* Cup body */}
            <div className="relative w-24 h-32 bg-gradient-to-b from-[#D7CCC8] to-[#8D6E63] rounded-b-2xl border-[3px] border-[#5D4037] overflow-hidden">
              {/* Coffee inside */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#6F4E37] to-[#4E3629] rounded-b-[14px] transition-all duration-1000 ease-out"
                style={{ height: `${Math.min(progress * 0.75, 75)}%` }}
              />
            </div>

            {/* Handle */}
            <div className="absolute right-[-22px] top-[25%] w-5 h-[40%] border-[3px] border-[#5D4037] border-l-0 rounded-r-xl" />

            {/* Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-3 bg-black/20 rounded-full blur-sm" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentStage.label}</span>
            <span className="text-muted-foreground">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">{currentStage.description}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              We're fetching your site, analyzing content structure, checking authority signals, and generating your detailed report. This takes 2-3 minutes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};