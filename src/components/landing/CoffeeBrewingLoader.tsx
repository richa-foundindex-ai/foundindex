import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
}

const STAGES = [
  { threshold: 0, label: "Analyzing your AI visibility", description: "Scanning website structure" },
  { threshold: 15, label: "Extracting content signals", description: "Checking content clarity" },
  { threshold: 30, label: "Evaluating authority signals", description: "Analyzing competitor positioning" },
  { threshold: 50, label: "Generating optimization recommendations", description: "Testing ChatGPT compatibility" },
  { threshold: 75, label: "Finalizing your score", description: "Preparing detailed report" },
  { threshold: 90, label: "Just a few more seconds", description: "Completing final checks" },
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
      <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">{currentStage.label}</h2>
          <p className="text-sm text-muted-foreground">
            {progress >= 30 && progress < 50 && "We're about halfway through."}
            {progress >= 50 && progress < 75 && "Almost done! Final checks underway."}
            {progress >= 75 && "Just a few more seconds..."}
            {progress < 30 && currentStage.description}
          </p>
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

          {showWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                We're diving deep into your website. This thorough analysis usually takes 2-3 minutes total.
              </p>
            </div>
          )}

          <div className="rounded-lg border bg-muted/50 p-3 flex gap-2">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              We're checking how easily ChatGPT understands your business.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
