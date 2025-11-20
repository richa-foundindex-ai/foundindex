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

        <div className="relative w-64 h-64 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="mugGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#654321', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3E2723', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#5D4037', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
              </linearGradient>
              <filter id="cupDepth">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="3" result="offsetblur"/>
                <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="cupClip">
                <path d="M 55 65 L 65 175 Q 100 180 135 175 L 145 65 Z" />
              </clipPath>
            </defs>
            
            <g>
              <ellipse cx="85" cy="45" rx="3" ry="8" fill="#E0E0E0" opacity="0.4">
                <animate attributeName="cy" values="45;25;15" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.2;0" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="100" cy="40" rx="3" ry="8" fill="#E0E0E0" opacity="0.5">
                <animate attributeName="cy" values="40;20;10" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.3;0" dur="2.5s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="115" cy="45" rx="3" ry="8" fill="#E0E0E0" opacity="0.4">
                <animate attributeName="cy" values="45;25;15" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.2;0" dur="2.2s" repeatCount="indefinite" />
              </ellipse>
            </g>
            
            <g filter="url(#cupDepth)">
              <path d="M 55 65 L 65 175 Q 100 180 135 175 L 145 65 Z" fill="url(#mugGradient)" stroke="#5D4037" strokeWidth="4" />
              <ellipse cx="100" cy="65" rx="45" ry="8" fill="#A0826D" stroke="#5D4037" strokeWidth="3" />
              <ellipse cx="100" cy="63" rx="42" ry="6" fill="url(#shineGradient)" />
              
              <g clipPath="url(#cupClip)">
                <rect x="50" y={200 - (progress * 1.1)} width="100" height={progress * 1.1} fill="url(#coffeeGradient)" style={{ transition: 'y 0.3s ease-out, height 0.3s ease-out' }} />
              </g>
              
              <path d="M 145 85 C 165 85, 170 100, 170 110 C 170 120, 165 135, 145 135" fill="none" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
              <path d="M 147 87 C 163 87, 167 100, 167 110 C 167 120, 163 133, 147 133" fill="none" stroke="#8B4513" strokeWidth="2" opacity="0.5" />
              <circle cx="145" cy="85" r="3" fill="#5D4037" />
              <circle cx="145" cy="135" r="3" fill="#5D4037" />
            </g>
            
            {[...Array(5)].map((_, i) => {
              const delay = i * 0.8;
              const xPosition = 70 + (i * 15);
              return (
                <g key={i}>
                  <ellipse cx={xPosition} cy="0" rx="4" ry="6" fill="#3E2723" stroke="#5D4037" strokeWidth="1">
                    <animate attributeName="cy" values="0;180;170" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;1;0" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${xPosition} 0`} to={`360 ${xPosition} 180`} dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                  </ellipse>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>~{Math.max(0, Math.round((100 - progress) * 1.5))} seconds remaining</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#8B4513] via-[#A0826D] to-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="text-center space-y-1 min-h-[80px]">
          <p className="text-lg font-semibold animate-pulse">{currentStage.label}</p>
          <p className="text-sm text-muted-foreground">({currentStage.description})</p>
        </div>

        <Card className="p-4 bg-accent-red-light border-primary/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Why does this take time?</p>
              <p className="text-sm text-muted-foreground">
                We're fetching your site, analyzing content structure, checking authority signals, and generating your detailed report. This takes 2-3 minutes.
              </p>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
};
