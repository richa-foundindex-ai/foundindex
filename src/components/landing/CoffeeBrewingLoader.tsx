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
              <linearGradient id="cupOutlineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8B7355', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#5D4037', stopOpacity: 0.95 }} />
              </linearGradient>
              <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6F4E37', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#5D4037', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.5 }} />
                <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="cupBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.08 }} />
                <stop offset="100%" style={{ stopColor: '#654321', stopOpacity: 0.12 }} />
              </linearGradient>
              <filter id="cupShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="cupClip">
                <path d="M 60 65 Q 60 70 62 72 L 68 172 Q 70 178 100 180 Q 130 178 132 172 L 138 72 Q 140 70 140 65 Z" />
              </clipPath>
            </defs>
            
            {/* Shadow underneath cup */}
            <ellipse cx="100" cy="188" rx="50" ry="10" fill="black" opacity="0.2" filter="url(#cupShadow)" />
            
            {/* Coffee inside (fills up with wave effect) */}
            <g clipPath="url(#cupClip)">
              <rect
                x="55"
                y={180 - (progress * 1.15)}
                width="90"
                height={progress * 1.15}
                fill="url(#coffeeGradient)"
                opacity="1"
              >
                <animate
                  attributeName="y"
                  from="180"
                  to="65"
                  dur="150s"
                  fill="freeze"
                />
                <animate
                  attributeName="height"
                  from="0"
                  to="115"
                  dur="150s"
                  fill="freeze"
                />
              </rect>
              {/* Subtle wave on coffee surface */}
              <path
                d={`M 55 ${180 - (progress * 1.15)} Q 77.5 ${178 - (progress * 1.15)} 100 ${180 - (progress * 1.15)} T 145 ${180 - (progress * 1.15)}`}
                fill="none"
                stroke="#8B6F47"
                strokeWidth="1.5"
                opacity="0.5"
              >
                <animate
                  attributeName="d"
                  values={`M 55 ${180 - (progress * 1.15)} Q 77.5 ${178 - (progress * 1.15)} 100 ${180 - (progress * 1.15)} T 145 ${180 - (progress * 1.15)}; M 55 ${180 - (progress * 1.15)} Q 77.5 ${182 - (progress * 1.15)} 100 ${180 - (progress * 1.15)} T 145 ${180 - (progress * 1.15)}; M 55 ${180 - (progress * 1.15)} Q 77.5 ${178 - (progress * 1.15)} 100 ${180 - (progress * 1.15)} T 145 ${180 - (progress * 1.15)}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
            
            {/* Coffee cup body (semi-transparent with gradient) */}
            <path
              d="M 60 65 Q 60 70 62 72 L 68 172 Q 70 178 100 180 Q 130 178 132 172 L 138 72 Q 140 70 140 65 Z"
              fill="url(#cupBodyGradient)"
              stroke="url(#cupOutlineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Cup rim (top ellipse with shine) */}
            <ellipse
              cx="100"
              cy="65"
              rx="40"
              ry="10"
              fill="none"
              stroke="url(#cupOutlineGradient)"
              strokeWidth="3.5"
            />
            <ellipse
              cx="100"
              cy="65"
              rx="40"
              ry="10"
              fill="url(#shineGradient)"
            />
            
            {/* Cup handle (more rounded) */}
            <path
              d="M 138 80 Q 165 80 168 110 Q 168 140 138 140"
              fill="none"
              stroke="url(#cupOutlineGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 140 82 Q 163 82 165 110 Q 165 138 140 138"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Steam wisps (more visible) */}
            <g opacity="0.7">
              <path d="M 75 55 Q 70 40 75 25" stroke="#B8B8B8" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <animate attributeName="d" values="M 75 55 Q 70 40 75 25; M 75 55 Q 80 40 75 25; M 75 55 Q 70 40 75 25" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7; 0.4; 0.7" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M 100 50 Q 105 35 100 20" stroke="#B8B8B8" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <animate attributeName="d" values="M 100 50 Q 105 35 100 20; M 100 50 Q 95 35 100 20; M 100 50 Q 105 35 100 20" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7; 0.4; 0.7" dur="3.5s" repeatCount="indefinite" />
              </path>
              <path d="M 125 55 Q 130 40 125 25" stroke="#B8B8B8" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <animate attributeName="d" values="M 125 55 Q 130 40 125 25; M 125 55 Q 120 40 125 25; M 125 55 Q 130 40 125 25" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7; 0.4; 0.7" dur="4s" repeatCount="indefinite" />
              </path>
            </g>
            
            {/* Animated coffee beans dancing around with rotation */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <ellipse
                  cx="100"
                  cy="100"
                  rx="5"
                  ry="7"
                  fill="#6F4E37"
                  stroke="#4A3428"
                  strokeWidth="0.5"
                  opacity="0.85"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`${i * 60} 100 100`}
                    to={`${i * 60 + 360} 100 100`}
                    dur="10s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 0,-12; 0,0"
                    dur="2.5s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="4s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                </ellipse>
                {/* Bean center line */}
                <line
                  x1="100"
                  y1="94"
                  x2="100"
                  y2="106"
                  stroke="#4A3428"
                  strokeWidth="1"
                  opacity="0.5"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`${i * 60} 100 100`}
                    to={`${i * 60 + 360} 100 100`}
                    dur="10s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 0,-12; 0,0"
                    dur="2.5s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="4s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                </line>
              </g>
            ))}
          </svg>
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