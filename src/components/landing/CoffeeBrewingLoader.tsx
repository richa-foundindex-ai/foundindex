import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
  website?: string;
}

const STAGES = [
  { threshold: 0, label: "Scanning website structure", description: "Scanning website structure" },
  { threshold: 20, label: "Evaluating content clarity", description: "Checking content clarity" },
  { threshold: 40, label: "Checking authority signals", description: "Analyzing authority signals" },
  { threshold: 60, label: "Generating recommendations", description: "Creating optimization recommendations" },
  { threshold: 80, label: "Finalizing your score", description: "Preparing detailed report" },
];

export const CoffeeBrewingLoader = ({ onComplete, website }: CoffeeBrewingLoaderProps) => {
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
      <Card className="max-w-2xl w-full p-8 space-y-8 shadow-2xl">
        {website && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Analyzing:</p>
            <p className="text-lg font-semibold text-foreground">{website}</p>
          </div>
        )}
        
        {/* Firefly animation container */}
        <div className="relative h-24 flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            {/* Trail effect */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full transition-all duration-300"
              style={{ 
                left: '0%',
                width: `${progress}%`,
                background: `linear-gradient(to right, transparent, hsl(var(--primary) / ${progress / 200}))`,
              }}
            />
            
            {/* Firefly */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary transition-all duration-1000 ease-linear"
              style={{ 
                left: `${progress}%`,
                transform: `translate(-50%, -50%)`,
                boxShadow: `0 0 ${10 + (progress / 100) * 30}px hsl(var(--primary) / ${0.3 + (progress / 100) * 0.7}),
                           0 0 ${20 + (progress / 100) * 50}px hsl(var(--primary) / ${0.2 + (progress / 100) * 0.5}),
                           0 0 ${30 + (progress / 100) * 70}px hsl(var(--primary) / ${0.1 + (progress / 100) * 0.3})`,
              }}
            />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{Math.round(progress)}%</p>
        </div>

        {/* Stage description */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">{currentStage.description}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              This analysis takes 2-3 minutes to ensure accuracy.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 flex gap-2">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              AI is analyzing your content the same way it processes user questions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
