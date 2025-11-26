import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
  website?: string;
}

const STAGES = [
  { 
    threshold: 0, 
    progress: 10,
    emoji: "🔍",
    label: "Fetching your homepage...",
    description: "Analyzing HTML structure and content"
  },
  { 
    threshold: 20, 
    progress: 25,
    emoji: "📊",
    label: "Extracting key information...",
    description: "Reading headlines, descriptions, and page structure"
  },
  { 
    threshold: 35, 
    progress: 45,
    emoji: "🤖",
    label: "Running AI analysis...",
    description: "Evaluating content clarity and positioning"
  },
  { 
    threshold: 50, 
    progress: 65,
    emoji: "⚡",
    label: "Checking authority signals...",
    description: "Looking for case studies, testimonials, and credibility markers"
  },
  { 
    threshold: 70, 
    progress: 80,
    emoji: "🎯",
    label: "Scoring discoverability...",
    description: "Testing how easily AI can extract key information"
  },
  { 
    threshold: 85, 
    progress: 95,
    emoji: "✨",
    label: "Finalizing your report...",
    description: "Generating personalized recommendations"
  },
];

const FUN_FACTS = [
  "68% of websites score below 60 on Authority Signals",
  "Sites with clear value propositions rank 3x higher in AI results",
  "Adding FAQ sections can boost discoverability by 40%",
  "Most websites miss basic Schema.org markup",
  "Case studies with metrics increase authority scores significantly",
];

export const CoffeeBrewingLoader = ({ onComplete, website }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const warningTimeout = setTimeout(() => setShowWarning(true), 180000); // 3 minutes
    
    // Progress simulation with psychological tricks
    // Front-load the progress (fast start), slow down near the end
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Fast progress at start, slower near end
        let increment = 0.67;
        if (prev < 30) increment = 1.2; // Fast at start
        else if (prev < 60) increment = 0.8; // Medium
        else if (prev > 85) increment = 0.4; // Slow near end
        
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, 1000);

    // Rotate fun facts every 8 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(factInterval);
      clearTimeout(warningTimeout);
    };
  }, [onComplete]);

  const currentStage = STAGES.slice().reverse().find(stage => progress >= stage.threshold) || STAGES[0];
  const displayProgress = currentStage.progress + ((progress - currentStage.threshold) / (100 - currentStage.threshold)) * (100 - currentStage.progress) * 0.3;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-8 shadow-2xl">
        {website && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing:</p>
            <p className="text-lg font-semibold text-foreground break-all">{website}</p>
          </div>
        )}
        
        {/* Current stage with emoji */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl animate-pulse">{currentStage.emoji}</span>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">{currentStage.label}</p>
          <p className="text-sm text-muted-foreground">{currentStage.description}</p>
        </div>
        
        {/* Horizontal progress bar with glowing effect */}
        <div className="relative h-4 px-4">
          <div className="w-full h-3 bg-muted rounded-full relative overflow-hidden">
            {/* Filled progress */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(displayProgress, 100)}%` }}
            />
            {/* Shimmer effect */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer"
              style={{ 
                width: `${Math.min(displayProgress, 100)}%`,
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{Math.round(displayProgress)}%</p>
        </div>

        {/* Estimated time */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Analysis in progress (usually 2-3 minutes)
          </p>
        </div>

        {/* Fun fact card */}
        <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
          <p className="text-xs font-medium text-primary">💡 Did you know?</p>
          <p className="text-sm text-muted-foreground transition-opacity duration-500">
            {FUN_FACTS[currentFactIndex]}
          </p>
        </div>

        {/* Analysis checklist */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Evaluating across 5 factors:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Content clarity", "Discoverability", "Authority signals", "Technical structure", "Competitive positioning"].map((factor, i) => {
              const isCompleted = progress > (i + 1) * 18;
              return (
                <span 
                  key={i} 
                  className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${
                    isCompleted 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : "○"} {factor}
                </span>
              );
            })}
          </div>
        </div>

        {/* Warning for long wait */}
        {showWarning && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center space-y-1 animate-fade-in">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              🕐 Your analysis is taking longer than usual
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              Complex website detected - detailed results coming shortly!
            </p>
          </div>
        )}

        {/* Note about homepage */}
        <p className="text-xs text-center text-muted-foreground">
          Note: We analyze homepages only. Subpages redirect to main domain.
        </p>
      </Card>
    </div>
  );
};
