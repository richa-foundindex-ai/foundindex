import { useEffect, useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
}

const STAGES = [
  { threshold: 0, label: "Grinding fresh beans...", description: "Preparing 15 AI queries for your industry" },
  { threshold: 15, label: "Heating water to perfect temperature...", description: "Connecting to ChatGPT API" },
  { threshold: 30, label: "Brewing your first cup...", description: "Testing queries 1-5" },
  { threshold: 50, label: "Brewing your second cup...", description: "Testing queries 6-10" },
  { threshold: 70, label: "Brewing your third cup...", description: "Testing queries 11-15" },
  { threshold: 90, label: "Pouring your results...", description: "Calculating FoundIndex score" },
];

export const CoffeeBrewingLoader = ({ onComplete }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // Update progress every 11 seconds to reach 100% in ~88 seconds (8 stages)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 12.5; // 100 / 8 stages = 12.5% per stage
        if (next >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, 11000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentStage = STAGES.slice().reverse().find(stage => progress >= stage.threshold) || STAGES[0];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Brewing Your Results ☕</h2>
          <p className="text-muted-foreground">
            Testing your website across 15 AI queries...
          </p>
        </div>

        {/* Coffee Cup Animation */}
        <div className="relative w-48 h-48 mx-auto">
          {/* Cup */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-40 h-40 border-8 border-[#8B4513] rounded-b-3xl overflow-hidden bg-background">
              {/* Coffee Fill */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6F4E37] to-[#8B4513] transition-all duration-1000 ease-out"
                style={{ height: `${progress}%` }}
              >
                {/* Coffee Surface Bubbles */}
                {progress > 0 && (
                  <>
                    <div className="absolute top-2 left-4 w-3 h-3 bg-[#A0826D] rounded-full animate-pulse" />
                    <div className="absolute top-1 right-6 w-2 h-2 bg-[#A0826D] rounded-full animate-pulse delay-300" />
                    <div className="absolute top-3 right-10 w-2 h-2 bg-[#A0826D] rounded-full animate-pulse delay-700" />
                  </>
                )}
              </div>
              
              {/* Cup Handle */}
              <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-16 border-8 border-[#8B4513] border-l-0 rounded-r-full" />
            </div>
          </div>

          {/* Steam Animation */}
          {progress > 15 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 space-y-2">
              <div className="w-2 h-12 bg-gradient-to-t from-muted/80 to-transparent rounded-full animate-[fade-in_2s_ease-in-out_infinite]" />
              <div className="w-2 h-10 bg-gradient-to-t from-muted/60 to-transparent rounded-full animate-[fade-in_2s_ease-in-out_infinite_0.5s] ml-4" />
              <div className="w-2 h-8 bg-gradient-to-t from-muted/40 to-transparent rounded-full animate-[fade-in_2s_ease-in-out_infinite_1s] -ml-2" />
            </div>
          )}

          {/* Coffee Beans */}
          <div className="absolute top-2 left-2 text-2xl animate-bounce">🫘</div>
          <div className="absolute top-4 right-2 text-xl animate-bounce delay-300">🫘</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>~{Math.max(10, Math.round(90 - (progress * 0.9)))} seconds remaining</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B4513] via-[#A0826D] to-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-center space-y-1 min-h-[80px]">
          <p className="text-lg font-semibold">{currentStage.label}</p>
          <p className="text-sm text-muted-foreground">({currentStage.description})</p>
        </div>

        {/* Info Box */}
        <Card className="p-4 bg-accent-red-light border-primary/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Why does this take time?</p>
              <p className="text-sm text-muted-foreground">
                Each test runs 15 real AI queries through ChatGPT to see if it recommends your business. 
                Quality testing takes 60-90 seconds - just like brewing perfect coffee! ☕
              </p>
            </div>
          </div>
        </Card>

        {/* Sound Toggle */}
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bean-grinding sound effects {soundEnabled ? "enabled" : "disabled"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
};
