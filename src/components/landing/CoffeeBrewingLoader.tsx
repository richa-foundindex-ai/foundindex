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
  
  // Milestone controls
  const showBeans = progress >= 25;
  const beansSwirl = progress >= 50;
  const showSteam = progress >= 75;

  // Coffee fill height
  const coffeeHeight = Math.min(progress * 2.2, 220);

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
          <p className="text-muted-foreground">Analyzing your website's AI visibility...</p>
        </div>

        <div className="relative w-full h-[400px] mx-auto flex items-center justify-center">
          {/* Steam animation */}
          {showSteam && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-28 flex justify-center gap-3 z-20">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 opacity-0 animate-steam"
                  style={{
                    animationDelay: `${i * 0.6}s`,
                  }}
                >
                  <div className="w-full h-24 bg-gradient-to-t from-gray-400/30 to-transparent rounded-full blur-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Coffee Cup */}
          <div className="relative z-10">
            <svg width="280" height="320" viewBox="0 0 280 320" className="drop-shadow-xl">
              <defs>
                {/* Coffee gradient - light tan to dark brown */}
                <linearGradient id="coffee" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D2B48C" />
                  <stop offset="100%" stopColor="#704214" />
                </linearGradient>
                
                {/* Clip path for cup interior */}
                <clipPath id="cup-interior">
                  <path d="M 60 90 L 60 260 Q 60 280 80 280 L 200 280 Q 220 280 220 260 L 220 90 Z" />
                </clipPath>
              </defs>

              {/* Coffee liquid inside cup */}
              <g clipPath="url(#cup-interior)">
                <rect
                  x="60"
                  y={280 - coffeeHeight}
                  width="160"
                  height={coffeeHeight}
                  fill="url(#coffee)"
                />

                {/* Coffee beans */}
                {showBeans && (
                  <>
                    <circle
                      cx={140 + (beansSwirl ? Math.sin(progress * 0.1) * 30 : 0)}
                      cy={270 - coffeeHeight * 0.3}
                      r="8"
                      fill="#654321"
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx={120 + (beansSwirl ? Math.sin(progress * 0.12 + 1) * 25 : 0)}
                      cy={265 - coffeeHeight * 0.4}
                      r="7"
                      fill="#654321"
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx={160 + (beansSwirl ? Math.sin(progress * 0.11 + 2) * 28 : 0)}
                      cy={268 - coffeeHeight * 0.35}
                      r="7"
                      fill="#654321"
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx={135 + (beansSwirl ? Math.sin(progress * 0.13 + 3) * 32 : 0)}
                      cy={272 - coffeeHeight * 0.25}
                      r="6"
                      fill="#654321"
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx={155 + (beansSwirl ? Math.sin(progress * 0.09 + 4) * 26 : 0)}
                      cy={275 - coffeeHeight * 0.2}
                      r="6"
                      fill="#654321"
                      className="transition-all duration-1000"
                    />
                  </>
                )}
              </g>

              {/* Cup outline - transparent glass */}
              <path
                d="M 60 90 L 60 260 Q 60 280 80 280 L 200 280 Q 220 280 220 260 L 220 90 Z"
                fill="none"
                stroke="#888"
                strokeWidth="2.5"
              />

              {/* Cup rim */}
              <line
                x1="60"
                y1="90"
                x2="220"
                y2="90"
                stroke="#888"
                strokeWidth="3"
              />

              {/* Cup handle */}
              <path
                d="M 220 120 Q 245 120 250 150 Q 250 180 225 195"
                fill="none"
                stroke="#888"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes steam {
            0% {
              opacity: 0;
              transform: translateY(0);
            }
            30% {
              opacity: 0.5;
            }
            100% {
              opacity: 0;
              transform: translateY(-70px);
            }
          }
          
          .animate-steam {
            animation: steam 3s ease-out infinite;
          }
        `}</style>

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
