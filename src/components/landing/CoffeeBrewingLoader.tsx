import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
      <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl">
        {website && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Analyzing:</p>
            <p className="text-lg font-semibold text-foreground">{website}</p>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">{currentStage.label}</h2>
        </div>

        <div className="flex justify-center">
          <div style={{ width: 180, height: 180 }}>
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              styles={buildStyles({
                pathColor: 'hsl(var(--primary))',
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--muted))',
                textSize: '24px',
              })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{currentStage.label}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentStage.description}</p>
          </div>

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
