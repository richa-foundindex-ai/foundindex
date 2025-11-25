import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
  website?: string;
}

const STAGES = [
  { threshold: 0, label: "Scanning website structure", description: "Scanning website structure" },
  { threshold: 20, label: "Evaluating content clarity", description: "Evaluating content clarity" },
  { threshold: 40, label: "Checking information discoverability", description: "Checking information discoverability" },
  { threshold: 55, label: "Checking authority signals", description: "Checking authority signals" },
  { threshold: 70, label: "Analyzing technical structure", description: "Analyzing technical structure" },
  { threshold: 85, label: "Assessing competitive positioning", description: "Assessing competitive positioning" },
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
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Analyzing:</p>
            <p className="text-lg font-semibold text-foreground break-all">{website}</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Evaluating your homepage across 5 factors:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Content clarity", "Information discoverability", "Authority signals", "Technical structure", "Competitive positioning"].map((factor, i) => (
              <span key={i} className="text-xs bg-muted px-2 py-1 rounded">✓ {factor}</span>
            ))}
          </div>
        </div>
        
        {/* Horizontal progress bar with glowing dot */}
        <div className="relative h-24 flex items-center px-4">
          {/* Progress bar track */}
          <div className="w-full h-2 bg-border rounded-full relative overflow-visible">
            {/* Filled progress background */}
            <div 
              className="absolute inset-0 bg-primary/20 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            
            {/* Glowing dot that moves along the bar */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ 
                left: `${progress}%`,
                transform: `translate(-50%, -50%)`
              }}
            >
              {/* Glow trail behind the dot */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 h-2 rounded-l-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress * 2, 100)}px`,
                  background: `linear-gradient(to left, 
                    hsl(var(--primary) / ${progress / 100}), 
                    transparent)`,
                  boxShadow: `0 0 ${Math.max(8, progress / 4)}px hsl(var(--primary) / ${progress / 200})`
                }}
              />
              
              {/* Main glowing dot */}
              <div 
                className="relative w-3 h-3 rounded-full bg-primary transition-all duration-300"
                style={{
                  boxShadow: `
                    0 0 ${Math.max(10, progress / 3)}px hsl(var(--primary) / 0.8),
                    0 0 ${Math.max(20, progress / 2)}px hsl(var(--primary) / 0.6),
                    0 0 ${Math.max(30, progress)}px hsl(var(--primary) / ${progress / 250})
                  `,
                  filter: `brightness(${1 + progress / 150})`
                }}
              />
            </div>
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
          <div className="rounded-lg border bg-muted/50 p-3 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This analysis takes 2-3 minutes to ensure accuracy.
            </p>
            <p className="text-xs text-muted-foreground">
              Note: We analyze homepages only. Subpages redirect to main domain.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
